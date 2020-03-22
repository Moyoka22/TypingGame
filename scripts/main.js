
const sampleText = document.querySelector('.main-content__sample-text');
const userInputText = document.querySelector('.main-content__user-text');
const fullText = sampleText.innerHTML;

const correctSpanStartTag = '<span class="correct">';
const incorrectSpanStartTag = '<span class="incorrect">';

spanCorrect = function (fullText, end) {
    return spanAround(correctSpanStartTag)(fullText, 0, end) + fullText.slice(end, fullText.length);
};

spanCorrectIncorect = function (fullText, endCorrect, endIncorrect) {
    return spanAround(correctSpanStartTag)(fullText, 0, endCorrect) + spanAround(incorrectSpanStartTag)(fullText, endCorrect, endIncorrect) + fullText.slice(endIncorrect, fullText.length);
};

const timerSection = document.querySelector('.timer');
const timerWPMCount = timerSection.querySelector('.timer__wpm-count');
const timerCPMCount = timerSection.querySelector('.timer__cpm-count');
const timerAccuracy = timerSection.querySelector('.timer__accuracy-percentage');
const timerReset = timerSection.querySelector('.timer__reset-btn');
const refreshRate = 200;

let index = 0;
let correctIndex = 0;
let charsTyped = 0;
let wordsTyped = 0;
let correctCharsTyped = 0;
let timerRunning = false;
let runningTime = 0;
let timer = null;

function calculateMets() {
    if (correctCharsTyped == fullText.length) {
        clearInterval(timer);
        timmerRunning = false;
    }


    runningTime += 0.2;
    let WPMCount = wordsTyped * 60 / runningTime;
    let CPMCount = correctCharsTyped * 60 / runningTime;
    timerWPMCount.innerHTML = WPMCount.toFixed(2);
    timerCPMCount.innerHTML = CPMCount.toFixed(2);
    timerAccuracy.innerHTML = (correctCharsTyped * 100 / charsTyped).toFixed(2) + '%';
}
function startTimer() {
    timerRunning = true;
    return setInterval(calculateMets, refreshRate);
}
function spanAround(spanDefinition) {
    return function (string, start, end) {
        return spanDefinition + string.slice(start, end) + '</span>';
    };
}

function keyPressHandler(e, self) {
    if (!timerRunning) {
        timer = startTimer();
        console.log(timer);
        timerRunning = true;
        timerReset.classList.toggle('timer__reset--active');
    }
    let characterPressed = e.key;
    let keyCode = e.keyCode;
    function checkMatchesNext(characterPressed, keyCode) {
        if (characterPressed == fullText[correctIndex] && index == correctIndex) {
            index++;
            correctIndex++;
            charsTyped++;
            correctCharsTyped++;
            sampleText.innerHTML = spanCorrect(fullText, index);
            if (keyCode == 32 || (correctCharsTyped == fullText.length)) {
                setTimeout(function () { self.value = ''; }, 0);
                wordsTyped++;
            }
        } else {

            index++;
            charsTyped++;
            sampleText.innerHTML = spanCorrectIncorect(fullText, correctIndex, index);


        }

    }
    return checkMatchesNext(characterPressed, keyCode);
}


function keyDownHandler(e, self) {
    let keyCode = e.keyCode;
    if ((keyCode == 8 || keyCode == 46) && index > correctIndex) {
        index--;
        sampleText.innerHTML = spanCorrectIncorect(fullText, correctIndex, index);
    }
}

function resetMets(){
    index = 0;
    correctIndex = 0;
    charsTyped = 0;
    correctCharsTyped = 0; 
    wordsTyped = 0;
}

function resetTimer(){
    sampleText.innerHTML = fullText;
    userInputText.value = '';
    clearInterval(timer);
    timer = null;
    timerRunning = false;
    timerReset.classList.toggle('timer__reset--active');
    resetMets();
}

userInputText.addEventListener('keypress', function () {
    keyPressHandler(event, this);
}, false);
userInputText.addEventListener('keydown', function () {
    keyDownHandler(event, this);
}, false);

timerReset.addEventListener('click', function () {
    resetTimer(event, this);
}, false);