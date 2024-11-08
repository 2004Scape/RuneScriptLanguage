const vscode = require('vscode');
const matchType = require("../../enum/MatchType");
const searchUtils = require("../../utils/searchUtils");
const matchUtils = require("../../utils/matchUtils");

const gotoDefinitionProvider = {
  async provideDefinition(document, position, token) {
    const { match, word } = matchUtils.matchWord(document, position);
    if (match.id === matchType.UNKNOWN.id || !word) {
      return null;
    }
    if (match.declaration) {
      return new vscode.Location(document.uri, position);
    }
    switch (match.id) {
      case matchType.LOCAL_VAR.id: return gotoLocalVar(document, position, word);
      case matchType.INTERFACE.id: return gotoSpecific(match, word, "interface.pack");
      case matchType.COMMAND.id: return gotoSpecific(match, word, "engine.rs2");
      case matchType.SYNTH.id: return gotoSpecific(match, word, "sound.pack");
      default: return gotoDefault(match, word);
    }
  }
}

const gotoLocalVar = (document, position, word) => {
  const fileText = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
  const match = searchUtils.searchLocalVar(fileText, word);
  return !match ? null : new vscode.Location(document.uri, document.positionAt(match.index).translate(0, match[1].length + 1));
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

module.exports = gotoDefinitionProvider;
