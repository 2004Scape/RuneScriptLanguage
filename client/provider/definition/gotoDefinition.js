const vscode = require('vscode');
const matchType = require("../../enum/MatchType");
const searchSvc = require("../../service/searchSvc");
const matchUtils = require("../../utils/matchUtils");
const identifierSvc = require("../../service/identifierSvc");

const gotoDefinitionProvider = {
  async provideDefinition(document, position, token) {
    const { match, word } = await matchUtils.matchWord(document, position);
    if (match.id === matchType.UNKNOWN.id || !word) {
      return null;
    }
    if (match.declaration) {
      return new vscode.Location(document.uri, position);
    }
    if (match.id === matchType.LOCAL_VAR.id) {
      return gotoLocalVar(document, position, word);
    }
    return gotoDefinition(word, match);
  }
}

const gotoLocalVar = (document, position, word) => {
  const fileText = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
  const match = searchSvc.findLocalVar(fileText, word);
  return !match ? null : new vscode.Location(document.uri, document.positionAt(match.index).translate(0, match[1].length + 1));
}

const gotoDefinition = async (word, match) => {
  const definition = await identifierSvc.get(word, match);
  return (definition) ? definition.location : null;
}

module.exports = gotoDefinitionProvider;
