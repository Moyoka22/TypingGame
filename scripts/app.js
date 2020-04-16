const retrieveRandomText = (element) => {
  number = Math.floor(Math.random() * 5) + 1;
  return fetch(`../assets/sampleText/sample-${number}.txt`)
    .then((res) => res.text())
    .then((data) => {
      element.innerHTML = data;
    });
};

const sampleText = document.getElementById("sample-text");
const userInputText = document.getElementById("user-text");
let fullText;
retrieveRandomText(sampleText).then(() => {
  fullText = sampleText.innerHTML;
}); // sampleText.innerHTML; // TODO : Retrieve a random text file from some repository of samp

const correctSpanStartTag = '<span class="correct">';
const incorrectSpanStartTag = '<span class="incorrect">';
const cursorSpanStartTag = '<span class="cursor">';

function spanAround(spanDefinition) {
  return function (string, start, end) {
    return spanDefinition + string.slice(start, end) + "</span>";
  };
}

const spanCorrect = (fullText, end) => {
  return (
    spanAround(correctSpanStartTag)(fullText, 0, end - 1) +
    fullText.slice(end, fullText.length)
  );
};

const spanCorrectIncorrect = (fullText, endCorrect, endIncorrect) => {
  return (
    spanAround(correctSpanStartTag)(fullText, 0, endCorrect) +
    spanAround(cursorSpanStartTag)(fullText, endCorrect, endCorrect + 1) +
    spanAround(incorrectSpanStartTag)(
      fullText,
      endCorrect + 1,
      endIncorrect == endCorrect ? endCorrect + 1 : endIncorrect + 1
    ) +
    fullText.slice(endIncorrect + 1, fullText.length)
  );
};

const updateSampleText = (sampleTextElement, fullText, index, correctIndex) => {
  sampleTextElement.innerHTML =
    index == correctIndex
      ? spanCorrect(fullText, index)
      : spanCorrectIncorect(fullText, index, endIncorrect);
};

const metricsSection = document.getElementById("metrics");
const metricsWPMCount = metricsSection.querySelector("#wpm-count");
const metricsCPMCount = metricsSection.querySelector("#cpm-count");
const metricsAccuracy = metricsSection.querySelector("#accuracy-percentage");
const metricsReset = metricsSection.querySelector("#reset-btn");

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
      return (this._correctCharsTyped * 60) / seconds;
    };
    this.getWPM = function (seconds) {
      return (this._wordsTyped * 60) / seconds;
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

class Attempt {
  constructor(sampleText) {
    this._index = 0;
    this._correctIndex = 0;
    this._wordBoundary = 0;
    this._numOfWords = sampleText.split(" ").length;
    this.met = new Metric();
    this.nextChar = () => {
      return sampleText[this._correctIndex];
    };
    this.incrementCorrect = () => {
      this._index++;
      this._correctIndex++;
      this.met.incrementCorrect();
    };
    this.incrementIncorrect = () => {
      this._index++;
      this.met.incrementIncorrect();
    };
    this.isWordBoundary = () => {
      return (
        this._correctIndex >= 1 && sampleText[this._correctIndex - 1] == " "
      );
    };
    this.incrementWord = () => {
      this.met.incrementWord();
      this._wordBoundary = this._index;
    };
    this.checkChar = (char) => {
      if (this._correctIndex != this._index) {
        return false;
      }
      if (char == this.nextChar()) {
        this.incrementCorrect();
        if (this.isWordBoundary() || sampleText.length == this._correctIndex) {
          this.incrementWord();
        }
        return true;
      } else {
        this.incrementIncorrect();
        return false;
      }
    };

    this.isFinished = () => {
      return this.met.getWordsTyped() == this._numOfWords;
    };
    this.getIndex = () => {
      return this._index;
    };
    this.getMets = (runningTime) => {
      return {
        WPM: this.met.getWPM(runningTime),
        CPM: this.met.getCPM(runningTime),
        Accuracy: this.met.getAccuracy(),
      };
    };
    this.backspace = () => {
      if (this._index > this._correctIndex) {
        this._index--;
      }
    };
    this.getCorrectIndex = () => {
      return this._correctIndex;
    };
  }
}

let currentAttempt = null;
let pastAttempts = [];

const refreshMetric = (force) => {
  const t = timer.getInstance();
  t.incrementRunningTime();
  const runningTime = t.getRunningTime();
  const updateSteps = 10;
  steps = t.getSteps();
  if (steps % updateSteps == 0 || force) {
    let mets = currentAttempt.getMets(runningTime);
    metricsWPMCount.innerHTML = mets.WPM.toFixed(2);
    metricsCPMCount.innerHTML = mets.CPM.toFixed(2);
    metricsAccuracy.innerHTML = (mets.Accuracy * 100).toFixed(2) + "%";
  }
};

let timer = (() => {
  let _instance;
  let runningTime = 0;
  let timerRunning = false;
  let timerID = null;
  const refreshRate = 50;

  let createInstance = () => {
    return {
      getSteps: () => {
        return ((runningTime * 1000) / refreshRate) >> 0;
      },
      getRunningTime: () => {
        return runningTime;
      },
      incrementRunningTime: () => {
        runningTime += refreshRate / 1000;
      },
      getTimerID: () => {
        return timerID;
      },
      isRunning: () => {
        return timerRunning;
      },
      stop: () => {
        timerRunning = false;
        runningTime = 0;
        clearInterval(timerID);
        return timerID;
      },
      start: () => {
        timerRunning = true;
        timerID = setInterval(refreshMetric, refreshRate);
        return timerID;
      },
    };
  };

  return {
    getInstance: () => {
      return _instance ? _instance : createInstance();
    },
  };
})();

const userInputHandler = (e) => {
  if (!timer.getInstance().isRunning()) {
    currentAttempt = new Attempt(fullText);
    timer.getInstance().start();
  }
  let correctCharPressed = currentAttempt.checkChar(e.key);
  if (correctCharPressed) {
    userInputText.classList.remove("wrong");
    if (currentAttempt.isWordBoundary()) {
      userInputText.value = "";
    } else if (currentAttempt.isFinished()) {
      userInputText.value = "";
      refresh(true);
      stopTimer();
    }
  } else {
    e.preventDefault();
    userInputText.value = "";
    userInputText.classList.add("wrong");
  }
  sampleText.innerHTML = spanCorrectIncorrect(
    fullText,
    currentAttempt.getCorrectIndex(),
    currentAttempt.getIndex()
  );
};

const resetSampleText = () => {
  sampleText.innerHTML = fullText;
};

const resetUserInput = () => {
  userInputText.value = "";
};
const keydownHandler = (e) => {
  let keyCode = e.keyCode;
  if (
    (keyCode == 8 || keyCode == 46) &&
    currentAttempt.getIndex() > currentAttempt.getCorrectIndex()
  ) {
    currentAttempt.backspace();
    sampleText.innerHTML = spanCorrectIncorrect(
      fullText,
      currentAttempt.getCorrectIndex(),
      currentAttempt.getIndex()
    );
  }
};
const resetButtonHandler = (e) => {
  e.preventDefault();
  userInputText.classList.remove("wrong");
  t = timer.getInstance();
  t.stop();
  resetUserInput();
  resetSampleText();
};

// Event Listeners
userInputText.addEventListener("keydown", keydownHandler, false);
userInputText.addEventListener("keypress", userInputHandler, false);
metricsReset.addEventListener("click", resetButtonHandler, false);
