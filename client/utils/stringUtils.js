const eolRegex = /\r\n|\r|\n/;

const getLineText = function(input) {
  const endOfLine = eolRegex.exec(input);
  return !endOfLine ? input : input.substring(0, endOfLine.index);
}

const getLines = function(input) {
  return input.split(eolRegex);
}

module.exports = { getLineText, getLines };
