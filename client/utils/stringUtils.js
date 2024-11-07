const getLineText = function(input) {
  const endOfLine = /\r\n|\r|\n/.exec(input);
  return input.substring(0, endOfLine.index);
}

module.exports = { getLineText };
