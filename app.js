"use strict";

// Buttons
const btnOpenModal = document.querySelector(".show-modal");
const btnCloseModal = document.querySelector(".close-modal");
const modal = document.querySelector(".modal");
const resetGameBtn = document.querySelector('#reset--btn');
const overlay = document.querySelector(".overlay");
const keyboard = document.querySelectorAll(".keyboard--key");
const enterKey = document.querySelector("#enter-key");
const body = document.querySelector("body");
const msgContainer = document.querySelector(".message--container");
const guessContainer = document.querySelector('.guess--container');
const grayHintTile = document.querySelector('#hint--gray');
const yellowHintTile = document.querySelector('#hint--yellow');
const greenHintTile = document.querySelector('#hint--green');
const toggleThemeBtn = document.querySelector('#toggle--theme');
const themeBall = document.querySelector('.ball');

// Data structures for the game
let wordRows = [
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
];
let currentRow = 0;
let currentTile = 0;
let secretWord; 
let gameOver = false;
let tempDisableAllInput = false;

// Get random word using fetch API
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Host': 'random-words5.p.rapidapi.com',
		'X-RapidAPI-Key': '49e442de95mshc0a2d53e7e9181cp175d85jsnf7691a0e4630'
	}
};

fetch('https://random-words5.p.rapidapi.com/getMultipleRandom?count=1&wordLength=5', options)
	.then(response => response.json())
	.then(response => secretWord = response[0].toUpperCase())
	.catch(err => console.error(err));

// Toggle light and dark theme
toggleThemeBtn.addEventListener('click', () => {
    const body = document.querySelector('body');
    body.classList.toggle('active--dark');
    themeBall.classList.toggle('toggle--dark');
})

// Open Modal
btnOpenModal.addEventListener("click", () => {
    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
    grayHintTile.classList.add('tile--flip', 'gray--overlay');
    yellowHintTile.classList.add('tile--flip', 'yellow--overlay');
    greenHintTile.classList.add('tile--flip', 'green--overlay');
    tempDisableAllInput = true;
});

// Close Modal
btnCloseModal.addEventListener("click", () => {
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
    grayHintTile.classList.remove('tile--flip', 'gray--overlay');
    yellowHintTile.classList.remove('tile--flip', 'yellow--overlay');
    greenHintTile.classList.remove('tile--flip', 'green--overlay');
    tempDisableAllInput = false;
});

// Add letter to tile
const addLetter = function (letter) {
    if(gameOver || tempDisableAllInput) return;

    if (currentRow > 5 || currentTile > 4) return;

    wordRows[currentRow][currentTile] = letter;
    const tile = document.getElementById(
        `row-${currentRow} tile-${currentTile}`
    );
    currentTile++;
    tile.textContent = letter;
};

// Delete letter fromt tile
const deleteLetter = () => {
    if(gameOver || tempDisableAllInput) return;

    if (currentTile <= 0) return;

    currentTile--;
    const tile = document.getElementById(
        `row-${currentRow} tile-${currentTile}`
    );
    tile.textContent = "";
};

// Display relevant game message
const displayMessage = (message) => {
    const messageEl = document.createElement("p");
    messageEl.textContent = message;
    msgContainer.insertAdjacentElement("beforeend", messageEl);
    
    tempDisableAllInput = true;
    setTimeout(() => {
        msgContainer.removeChild(messageEl);
        tempDisableAllInput = false;
        
    }, 3000);
};

// Display the secret word if lost
const displayGuess = () => {
    const guessEl = document.createElement("p");
    guessEl.textContent = `The word was ${secretWord}`;
    guessContainer.insertAdjacentElement("beforeend", guessEl);
    setTimeout(() => {
        guessContainer.removeChild(guessEl);
    }, 3000);
}

// Add gray, yellow and green hints to tiles
const highlightAnswer = (userAnswer) => {
    if(gameOver) return;

    let checkSecretWord = secretWord;
    const guess = [];
    const rowTiles = document.getElementById(`guessRow-${currentRow}`).querySelectorAll('.letter--box');

    rowTiles.forEach(tile => {
        guess.push({ letter: tile.textContent, color: "gray" });
    });

    guess.forEach(guess => {
        if(checkSecretWord.includes(guess.letter)) {
            guess.color = 'yellow';
            checkSecretWord = checkSecretWord.replace(guess.letter, '');
        }
    });

    guess.forEach((guess, index) => {
        if(guess.letter === secretWord[index]) {
            guess.color = 'green';
            checkSecretWord = checkSecretWord.replace(guess.letter, '');
        }
    });

    const interval = 500;
    userAnswer.forEach((letter, index) => {
        const curTile = document.getElementById(
            `row-${currentRow} tile-${index}`
        );
        setTimeout(() => {
            curTile.classList.add('tile--flip');
            curTile.classList.add (`${guess[index].color}--overlay`);
            document.getElementById(`${letter}`).classList.add(`${guess[index].color}--overlay`);
        }, interval * index);
    });

    if (currentRow <= 5) {
        currentRow++;
        currentTile = 0;
    }
    
    tempDisableAllInput = true;
    setTimeout(() => {
        tempDisableAllInput = false;

        if (userAnswer.join("") === secretWord) {
            displayMessage("Wonderful");
            gameOver = true;
        } else if (currentRow > 5) {
            displayMessage("Better Luck Next Time");
            displayGuess(`The word is ${secretWord}`);
            gameOver = true;
            return;
        }
    }, 5 * interval);
};

// Check the submitted guess by user
const checkAnswer = () => {
    if (currentTile < 5 || tempDisableAllInput) return;

    const userAnswer = wordRows[currentRow].join("");
    highlightAnswer(wordRows[currentRow]);
};

// Check keypress of on-screen keyboard
const keyPress = (key) => {
    if (key.getAttribute("id") === "back-key") deleteLetter()
    else if (key.getAttribute("id") === "enter-key") checkAnswer();
    else addLetter(key.textContent);
};

// Listen for keypress on on-screen keyboard
keyboard.forEach((key) => {
    key.addEventListener("click", () => keyPress(key));
});

// Check if keypress is single letter word 
const isLetter = (char) => {
    if(char.length === 1) return (/[A-Z]/).test(char);
    return false;
}

// Listen for keypress on local user keyboard
document.addEventListener('keydown', (e) => {
    const letter = e.key.toUpperCase();

    if(e.ctrlKey || e.shiftKey) return;

    if(isLetter(letter)) addLetter(letter);

    if(letter === 'ENTER') checkAnswer();

    if(letter === 'BACKSPACE') deleteLetter();
})

// Temporarily Disable reset button after resetting game
const tempDisableReset = () => {
    resetGameBtn.removeEventListener("click", resetGame);
    setTimeout(() => resetGameBtn.addEventListener("click", resetGame), 3000);
}

// Reset game on pressing reset button
const resetGame = () => {
    if(tempDisableAllInput) return;

    displayMessage("Game has been reset");
    tempDisableReset();

    gameOver = false;
    tempDisableAllInput = false;
    currentRow = 0;
    currentTile = 0;
    wordRows = [
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
    ];
    
    const tiles = document.querySelectorAll('.letter--box');
    tiles.forEach(tile => {
        tile.textContent = '';
        tile.classList.remove('tile--flip', 'green--overlay', 'yellow--overlay', 'gray--overlay');
    })

    const keyboardKeys = document.querySelectorAll('.keyboard--key');
    keyboardKeys.forEach(key => {
        key.classList.remove('green--overlay', 'yellow--overlay', 'gray--overlay');
    })
}

// Button to reset the game
resetGameBtn.addEventListener("click", resetGame);

