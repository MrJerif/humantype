
let URL = `https://shortstories-api.onrender.com/`
let container = document.getElementById('words');
let game = document.getElementById('game');
const cursor = document.getElementById('cursor');
const info = document.getElementById('info');
const title = document.getElementById('title');
const author = document.getElementById('author');
const moral = document.getElementById('moral');
const newGame = document.getElementById('newGame');
const wpmDisplay = document.getElementById('wpm');
const gameTimeDisplay = document.getElementById('gameTime');
const gameOver = document.getElementById('gameOver');
const wpmScore = document.getElementById('score');
const correctWordsdiv = document.getElementById('correctWords');
const incorrectWordsdiv = document.getElementById('incorrectWords');
const grossWPM = document.getElementById('grossWPM');
const accuracy = document.getElementById('accuracy');
window.timer = null;
window.gameStart = null;
let correctWords = 0;
let incorrectWords = 0;
let totalWords = 0;

// functions to add and remove classes (for color purposes)
function addClass(el, name) {
    el.className += ' ' + name;
}

function removeClass(el, name) {
    el.className = el.className.replace(name, '');
}

async function createGame() {
    // Dynamically get the Game mode
    const gameTime = gameTimeDisplay.value;

    let response = await fetch(URL);
    let data = await response.json();

    // get the story
    let story = data.story;

    // Every letter in a seperate span
    container.innerHTML = `<div class="word"><span class= "letter" >${story.split('').join('</span><span class= "letter" >')}</span></div>`;

    // Reset everything
    clearInterval(window.timer);
    window.timer = null;
    window.gameStart = null;
    // info.addEventListener('change', () => {
    //     info.innerHTML = parseInt(gameTime);
        
    // })
    info.innerHTML = '';
    wpmDisplay.innerHTML = "WPM: "     // // Reset the WPM Count
    container.style.marginTop = "0px";  // Reset the margin for new game
    cursor.style.display = 'block';
    container.style.filter = `blur(0)`

    // Adding ".current" class to first letter of the word
    addClass(document.querySelector('.letter'), 'current');

    // Remove old event listener before adding the new one
    game.removeEventListener('keydown', handleKeyPress);
    game.addEventListener('keydown', handleKeyPress);   // Attach event listener for keypresses
}

// Handle typing logic
function handleKeyPress(ev) {
    let gameTime = gameTimeDisplay.value * 1000;

    const key = ev.key;
    const currentLetter = document.querySelector('.letter.current');
    const expected = currentLetter?.innerHTML || ' ';               // new thing learned (!) --optional chaining


    // check if current letter is of 1 character
    const isLetter = key.length === 1 && key.length != ' ';
    const isBackspace = key === 'Backspace';

    // Update time                                      // Tip: window.timer & window.new Date().getTime();
    if (!window.timer && isLetter) {
        // Start timer on first key press
        window.timer = setInterval(() => {
            if (!window.gameStart) {
                window.gameStart = (new Date()).getTime();
            }
            const currentTime = (new Date()).getTime();
            const millisecPassed = currentTime - window.gameStart;
            const secPassed = Math.floor(millisecPassed / 1000);
            // To prevent negative values
            const secLeft = Math.max(0, Math.floor((gameTime / 1000) - secPassed))

            // Time up (game over)
            if (secLeft <= 0) {
                clearInterval(window.timer);
                calculateWPM();
                game.removeEventListener('keydown', handleKeyPress);
                cursor.style.display = 'none';
                container.style.filter = `blur(5px)`
                return;
            }
            info.innerHTML = (secLeft - 1) + '';
        }, 1000);
    }

    // check typed input (currentLetter and expected letter)
    if (isLetter) {
        if (currentLetter) {
            if (key === expected) {
                addClass(currentLetter, 'correct');
                correctWords++;
            } else if (key !== expected) {
                addClass(currentLetter, 'incorrect');
                incorrectWords++;
            }

            removeClass(currentLetter, 'current');
            if (currentLetter.nextSibling) {
                addClass(currentLetter.nextSibling, !isBackspace ? 'current' : '');
            }
        }
    }

    // Handle game over 
    if (!currentLetter.nextSibling) {
        clearInterval(window.timer);
        calculateWPM();
    }

    // Handle cursor movement
    if (currentLetter && isBackspace) {
        // wordBuffer = wordBuffer.slice(0, -1); // Remove last letter from buffer
        cursor.style.top = currentLetter.previousSibling.getBoundingClientRect().top + 2 + 'px';
        cursor.style.left = currentLetter.previousSibling.getBoundingClientRect().left + 'px';
    }
    else if (currentLetter) {
        cursor.style.top = currentLetter.getBoundingClientRect().top + 2 + 'px';            // new thing learned (!) --getBoundingClientRect
        cursor.style.left = currentLetter.getBoundingClientRect().right + 'px';
    }
    // Move lines / words                                                               // Crazy trick (!) --move screen(lines) up
    if (currentLetter.getBoundingClientRect().top > 320) {
        const margin = parseInt(container.style.marginTop || '0');
        container.style.marginTop = (margin - 35) + 'px';
    }

    // check backspace
    if (isBackspace) {
        addClass(currentLetter.previousSibling, 'current');
        removeClass(currentLetter, 'current');
        // removeClass(currentLetter, 'correct' || 'incorrect');
        if (currentLetter.previousSibling.classList.contains('correct')) {
            removeClass(currentLetter.previousSibling, 'correct');
            correctWords--;
        } else if (currentLetter.previousSibling.classList.contains('incorrect')) {
            removeClass(currentLetter.previousSibling, 'incorrect');
            incorrectWords--;
        }
    }
}

// Function to calculate and display WPM 
function calculateWPM() {
    const currentTime = (new Date()).getTime();
    const millisecPassed = currentTime - window.gameStart;
    const minutesPassed = millisecPassed / 60000;  // Convert milliseconds to minutes
    totalWords = correctWords + incorrectWords

    // Gross WPM (Raw speed)
    const rawSpeed = Math.round((totalWords / 5) / minutesPassed);
    const errorRate = Math.round(incorrectWords / minutesPassed);

    // Accuracy
    const totalAccuracy = (correctWords / totalWords) * 100;

    // Net WPM
    const wpm = Math.round(rawSpeed - errorRate);

    gameOver.style.display = "flex";
    wpmDisplay.innerHTML = `WPM: ${wpm}`;
    wpmScore.innerHTML = ` ${wpm} WPM`;
    grossWPM.innerHTML = `Raw Speed: ${rawSpeed} WPM`;
    accuracy.innerHTML = `Accuracy: ${totalAccuracy}%`;
    correctWordsdiv.innerHTML = `Correct Words: ${correctWords}`;
    incorrectWordsdiv.innerHTML = `Incorrect Words: ${incorrectWords}`;
}

// Event listener to Restart the game
function handleNewGame () { 
    newGame.addEventListener('click', () => {
        // cursor.style.left = "0px";
        gameOver.style.display = "none";
        correctWords = 0;
        incorrectWords = 0;
        totalWords = 0;
        createGame();
    })
}
handleNewGame();

createGame();
