const correctSpanStartTag = '<span class="correct">';
const incorrectSpanStartTag = '<span class="incorrect">';
const cursorSpanStartTag = '<span class="cursor">';

function spanAround(spanDefinition) {
  return function (text, start, end) {
    return spanDefinition + text.slice(start, end) + "</span>";
  };
}

function spanCorrect(text, len, start = 0) {
  return spanAround(correctSpanStartTag)(text, start, start + len);
}
function spanIncorrect(text, len, start = 0) {
  return spanAround(incorrectSpanStartTag)(text, start, start + len);
}

function spanCursor(text, len, start = 0) {
  return spanAround(cursorSpanTag)(text, start, start + len);
}

/**
 * Produces a sequence of spans which represent the parts of the text which are correct, cursor and incorrect.
 * @param {String} text  The text string which will be transformed into a series of spans
 * @param {Number} correctIndex The index which marks the end of the correct span.
 * @param {Number} cursorIndex The index which marks the end of the cursor span.
 * @param {Number} incorrectIndex The index which marks the end of the incorrect span.
 * @return {String}  A string containing the HTML which forms the correct span element sequence.
 * */
export function spanText(text, correctIndex, cursorIndex, incorrectIndex) {
  return (
    spanCorrect(text, correctIndex) +
    spanCursor(text, cursorIndex - correctIndex, correctIndex) +
    spanIncorrect(text, incorrectIndex - cursorIndex, incorrectIndex) +
    text.slice(incorrectIndex, text.length)
  );
}
