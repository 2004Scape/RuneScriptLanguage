const regex = {
  COORD: /(\d+_){4}\d+/,
  COLOR: /\d{6}/,
  NUMBER: /^\d+.?\d+$/,
  END_OF_BLOCK: /(\r\n|\r|\n)(\[.+|val=.+|\^.+|\d+=.+)(?:$|(\r\n|\r|\n))/,
  START_OF_LINE: /(?<=[\n])(?!.*[\n]).*/,
  END_OF_LINE: /\r\n|\r|\n/,
  WORD_PATTERN: /(\.\w+)|(\w+:\w+)|([^\`\~\!\@\#\%\^\&\*\(\)\-\$\=\+\[\{\]\}\\\|\;\:\'\\"\,\.\<\>\/\?\s]+)/g,
  CONFIG_LINE: /^\w+=.+$/,
  CONFIG_DECLARATION: /\[\w+\]/,
  TRIGGER_LINE: /\[\w+,(\.)?\w+\]/
}

module.exports = regex;
