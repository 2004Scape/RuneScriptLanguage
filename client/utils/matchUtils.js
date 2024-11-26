const { WORD_PATTERN } = require("../enum/regex");

function getWords(lineText) {
  return [ ...lineText.matchAll(WORD_PATTERN) ].map((wordMatch, index) => { 
    return { value: wordMatch[0], start: wordMatch.index, end: wordMatch.index + wordMatch[0].length - 1, index: index}
  });
}

function getWordAtIndex(words, index) {
  if (words.length < 1) return null;
  let prev; 
  for (let i = words.length - 1; i >= 0; i--) {
    if (index <= words[i].end) prev = words[i];
    else break;
  }
  return (prev && prev.start <= index && prev.end >= index) ? prev : null
}

function expandCsvKeyObject(obj) {
  let keys = Object.keys(obj);
  for (let i = 0; i < keys.length; ++i) {
    let key = keys[i];
    let subkeys = key.split(/,\s?/);
    let target = obj[key];
    delete obj[key];
    subkeys.forEach(k => obj[k] = target);
  }
  return obj;
}

function reference(type, extraData) {
  return (extraData) ? { ...type, extraData: extraData, declaration: false } : { ...type, declaration: false };
}

function declaration(type, extraData) {
  return (extraData) ? { ...type, extraData: extraData, declaration: true } : { ...type, declaration: true };
}

module.exports = { getWords, getWordAtIndex, expandCsvKeyObject, reference, declaration };
