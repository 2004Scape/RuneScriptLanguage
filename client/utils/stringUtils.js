const endOfLineRegex = /\r\n|\r|\n/;
// finds first blank line, comment line, line starting with '[', or line starting with "val=" (special case for enums)
const endOfBlockRegex = /[\r\n|\r|\n](\s*|\/\/.+|\[.+|val=.+)[\r\n|\r|\n]/; 

const getLineText = function(input) {
  const endOfLine = endOfLineRegex.exec(input);
  return !endOfLine ? input : input.substring(0, endOfLine.index);
}

const getLines = function(input) {
  return input.split(endOfLineRegex);
}

const skipFirstLine = function(input) {
  const endOfLine = endOfLineRegex.exec(input);
  return !endOfLine ? input : input.substring(endOfLine.index + 1);
}

const getPreviousLine = function(str) {
  const lines = getLines(str);
  return lines[lines.length - 2] || '';
}

const getBlockText = function(input) {
  const endOfBlock = endOfBlockRegex.exec(input);
  return !endOfBlock ? input : input.substring(0, endOfBlock.index);
}

const nthIndexOf = function(input, pattern, n) {
  let i = -1;
  while (n-- > 0 && i++ < input.length) {
    i = input.indexOf(pattern, i);
    if (i < 0) break;
  }
  return i;
}

const truncateMatchingParenthesis = function(str) {
  let truncateIndex = 0;
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (str.charAt(i) === '(') count++;
    if (str.charAt(i) === ')' && --count === 0) truncateIndex = i;
  }
  return (truncateIndex > 0) ? str.substring(truncateIndex + 1) : str;
}

module.exports = { getLineText, getLines, skipFirstLine, getPreviousLine, getBlockText, nthIndexOf, truncateMatchingParenthesis };
