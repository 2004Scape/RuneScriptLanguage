const matchType = require("../../enum/MatchType");
const searchUtils = require("../../utils/searchUtils");
const matchUtils = require("../../utils/matchUtils");

const gotoDefinitionProvider = {
  async provideDefinition(document, position, token) {
    const { match, word } = matchUtils.matchWord(document, position);
    return gotoDefinition(match, word);
  }
}

const gotoDefinition = async (match, word) => {
  if (!match || !match.definitionFiles || !match.definitionFormat || !word) {
    return null;
  }
  switch (match.id) {
    case matchType.INTERFACE.id: return gotoSpecific(match, word, "interface.pack");
    case matchType.COMMAND.id: return gotoSpecific(match, word, "engine.rs2");
    default: return gotoDefault(match, word);
  }
}

const gotoSpecific = (match, word, fileName) => {
  const offset = match.definitionFormat.indexOf("NAME");
  const pattern = match.definitionFormat.replace("NAME", word);
  return searchUtils.searchFile(pattern, fileName, offset);
}

const gotoDefault = async (match, word) => {
  const pattern = match.definitionFormat.replace("NAME", word);
  const offset = match.definitionFormat.indexOf("NAME");
  const results = await searchUtils.searchFiles(pattern, match.definitionFiles, offset, 1);
  return (!results || results.length === 0) ? null : results[0].location;
}

module.exports = { gotoDefinitionProvider, gotoDefinition };
