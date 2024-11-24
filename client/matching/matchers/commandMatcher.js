const { commands } = require("../../resource/engineCommands");
const matchType = require("../matchType");
const { reference, declaration } = require("../../utils/matchUtils");

// Looks for matches of known engine commands
async function commandMatcher(context) {
  if (context.word.value in commands && context.prevChar !== '[') {
    return (context.uri.path.includes("engine.rs2")) ? declaration(matchType.COMMAND) : reference(matchType.COMMAND);
  }
}

module.exports = commandMatcher;
