const eolRegex = /\r\n|\r|\n/;

const getLineText = function(input) {
  const endOfLine = eolRegex.exec(input);
  return !endOfLine ? input : input.substring(0, endOfLine.index);
}

const getLines = function(input) {
  return input.split(eolRegex);
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
  return str.substring(truncateIndex + 1);
}

module.exports = { getLineText, getLines, nthIndexOf, truncateMatchingParenthesis };
