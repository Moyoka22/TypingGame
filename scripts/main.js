
const sampleText = document.querySelector('.main-content__sample-text');
const userInputText = document.querySelector('.main-content__user-text');
const fullText = sampleText.innerHTML; // TODO : Retrieve a random text file from some repository of sample texts 

const correctSpanStartTag = '<span class="correct">';
const incorrectSpanStartTag = '<span class="incorrect">';

spanCorrect = function (fullText, end) {
    return spanAround(correctSpanStartTag)(fullText, 0, end) + fullText.slice(end, fullText.length);
};

spanCorrectIncorect = function (fullText, endCorrect, endIncorrect) {
    return spanAround(correctSpanStartTag)(fullText, 0, endCorrect) + spanAround(incorrectSpanStartTag)(fullText, endCorrect, endIncorrect) + fullText.slice(endIncorrect, fullText.length);
};

const metricsSection = document.querySelector('.metrics');
const metricsWPMCount = metricsSection.querySelector('.metrics__wpm-count');
const metricsCPMCount = metricsSection.querySelector('.metrics__cpm-count');
const metricsAccuracy = metricsSection.querySelector('.metrics__accuracy-percentage');
const metricsReset = metricsSection.querySelector('.metrics__reset-btn');

const refreshRate = 50;
const updateSteps = 10;

class Metric {
    constructor() {
        this._charsTyped = 0;
        this._wordsTyped = 0;
        this._correctCharsTyped = 0;
        this.getAccuracy = function () {
            if (this._charsTyped == 0) {
                return 0;
            }
            return this._correctCharsTyped / this._charsTyped;
        };
        this.getCPM = function (seconds) {
            return this._correctCharsTyped * 60 / seconds;
        };
        this.getWPM = function (seconds) {
            return this._wordsTyped * 60 / seconds;
        };
        this.incrementCorrect = function () {
            this._charsTyped++;
            this._correctCharsTyped++;
        };
        this.incrementIncorrect = function () {
            this._charsTyped++;
        };
        this.getWordsTyped = function () {
            return this._wordsTyped;
        };
        this.incrementWord = function () {
            this._wordsTyped++;
        };
    }
}


let attemptFactory = function (sampleText) {
    return (function () {
        let index = 0;
        let correctIndex = 0;
        let wordBoundary = 0;
        let numOfWords = sampleText.split(' ').length;
        let met = new Metric();
        return {
            nextChar: function () {
                return sampleText[correctIndex];
            },
            incrementCorrect: function () {
                index++;
                correctIndex++;
                met.incrementCorrect();
            },
            incrementIncorrect: function () {
                index++;
                met.incrementIncorrect();
            },
            isWordBoundary() {
                return correctIndex >= 1 && sampleText[correctIndex - 1] == ' ';
            },
            incrementWord() {
                met.incrementWord();
                wordBoundary = index;
            },
            checkChar(char) {

                if (correctIndex != index) {
                    return false;
                }
                if (char == this.nextChar()) {
                    this.incrementCorrect();
                    if (this.isWordBoundary() || sampleText.length == correctIndex) {
                        this.incrementWord();
                    }
                    return true;
                } else {
                    this.incrementIncorrect();
                    return false;
                }


            },
            isFinished() {
                return met.getWordsTyped() == numOfWords;
            },
            getIndex() {
                return index;
            },
            getCorrectIndex() {
                return correctIndex;
            },
            backspace() {
                if (index > correctIndex) {
                    index--;
                }
            },
            getWPM(runningTime) {
                return met.getWPM(runningTime);
            },
            getCPM(runningTime) {
                return met.getCPM(runningTime);
            },
            getAccuracy() {
                return met.getAccuracy();
            }
        };
    })();
};

let currentAttempt = null;
let pastAttempts = [];

// TODO : Timer Object
let runningTime = 0;
let timerID = null;
let timerRunning = false;


function refresh(force) {
    runningTime += (refreshRate / 1000);
    steps = (runningTime * 1000 / refreshRate) >> 0;
    if (steps % updateSteps == 0 || force) {
        metricsWPMCount.innerHTML = currentAttempt.getWPM(runningTime).toFixed(2);
        metricsCPMCount.innerHTML = currentAttempt.getCPM(runningTime).toFixed(2);
        metricsAccuracy.innerHTML = (currentAttempt.getAccuracy() * 100).toFixed(2) + '%';
    }
}

function resetSampleText() {
    sampleText.innerHTML = fullText;
}
function startTimer() {
    timerRunning = true;
    metricsReset.classList.toggle('metrics__reset--active');
    return setInterval(refresh, refreshRate);
}

function stopTimer() {
    if (timerRunning) {
        clearInterval(timerID);
        timerRunning = false;
        runningTime = 0;
        metricsReset.classList.toggle('metrics__reset--active');
        setTimeout(function () {
            userInputText.value = ''
        }, 0);
        resetSampleText();
    }
}

function spanAround(spanDefinition) {
    return function (string, start, end) {
        return spanDefinition + string.slice(start, end) + '</span>';
    };
}

function userInputHandler(e, self) {
    if (!timerRunning) {
        currentAttempt = attemptFactory(fullText);
        timerID = startTimer();
    }

    let characterPressed = e.key;
    let correctCharPressed = currentAttempt.checkChar(characterPressed);
    if (correctCharPressed) {
        if (currentAttempt.isWordBoundary()) {
            userInputText.value = '';
        } else if (currentAttempt.isFinished()) {
            userInputText.value = '';
            refresh(true);
            stopTimer();

        }
    }
    sampleText.innerHTML = spanCorrectIncorect(fullText, currentAttempt.getCorrectIndex(), currentAttempt.getIndex());
}


function userKeyDownHandler(e, self) {
    let keyCode = e.keyCode;
    if ((keyCode == 8 || keyCode == 46) && currentAttempt.getIndex() > currentAttempt.getCorrectIndex()) {
        currentAttempt.backspace();
        sampleText.innerHTML = spanCorrectIncorect(fullText, currentAttempt.getCorrectIndex(), currentAttempt.getIndex());
    }
}



userInputText.addEventListener('keypress', function () {
    userInputHandler(event, this);
}, false);
userInputText.addEventListener('keydown', function () {
    userKeyDownHandler(event, this);
}, false);

metricsReset.addEventListener('click', function () {
    stopTimer();
}, false);