const vscode = require('vscode');
const matchUtils = require('../../utils/matchUtils');
const searchUtils = require('../../utils/searchUtils');
const matchType = require('../../enum/MatchType');
const gotoDefinition = require('./gotoDefinition');

const runescriptDefinitionProvider = {
  async provideDefinition(document, position, token) {
    const { word, match } = matchUtils.matchWord(document, position);
    switch (match.id) {
      case matchType.UNKNOWN.id: return null;
      case matchType.LOCAL_VAR.id: return gotoLocalVar(document, position, word);
      default: return gotoDefinition.gotoDefinition(match, word);
    }
  }
}

const gotoLocalVar = (document, position, word) => {
  const fileText = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
  const match = searchUtils.searchLocalVar(fileText, word);
  return !match ? null : new vscode.Location(document.uri, document.positionAt(match.index).translate(0, match[1].length + 1));
}

module.exports = runescriptDefinitionProvider;
