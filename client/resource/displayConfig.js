// Built in options for modifying the hover text displays, if extra customization is needed, provide a postProcessor for the match type

const option = {
  LANGUAGE: 'LANGUAGE', // the code language that this matchType should use in hover codeblock text
  BLOCK_SKIP_LINES: 'BLOCK_SKIP_LINES', // the number of lines to skip in code block displays (default value is 1 -> skip first line for most blocks which is the '[identifierName]' line)
  CONFIG_INCLUSIONS: 'CONFIG_INCLUSIONS' // the config tags you want to be shown (ex: obj displays name, desc, and category only), if null (default) then all fields are displayed
}

const resolve = function(opt, match) {
  const config = (!match.displayConfig) ? {} : match.displayConfig;
  switch(opt) {
    case option.LANGUAGE: return config[opt] || 'runescript';
    case option.BLOCK_SKIP_LINES: return (config[opt] !== undefined) ? match.displayConfig[opt] : 1;
    case option.CONFIG_INCLUSIONS: return config[opt] || null;
  }
}

module.exports = { option, resolve };
