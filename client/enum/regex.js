const regex = {
  COORD: /\b(\d+_){4}\d+\b/,
  END_OF_BLOCK: /[\r\n|\r|\n](\s*|\[.+|val=.+|\^.+|\d+=.+)(?:$|[\r\n|\r|\n])/,
  END_OF_LINE: /\r\n|\r|\n/,
  WORD_PATTERN: /(\w+:\w+)|([^\`\~\!\@\#\%\^\&\*\(\)\-\$\=\+\[\{\]\}\\\|\;\:\'\\"\,\.\<\>\/\?\s]+)/g
}

module.exports = regex;
