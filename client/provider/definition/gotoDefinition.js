const vscode = require('vscode');
const searchSvc = require("../../service/searchSvc");
const matchUtils = require("../../utils/matchUtils");
const identifierSvc = require("../../service/identifierSvc");
const matchType = require('../../resource/matchType');

const gotoDefinitionProvider = {
  async provideDefinition(document, position, token) {
    const { match, word } = await matchUtils.matchWord(document, position);
    if (match.id === matchType.UNKNOWN.id || !word || match.isHoverOnly) {
      return null;
    }

    // If we are already on a declaration, there is nowhere to goto. Returning current location
    // indicates to vscode that we instead want to try doing "find references"
    if (match.declaration) {
      return new vscode.Location(document.uri, position);
    }

    // Local vars treated different from the rest
    if (match.id === matchType.LOCAL_VAR.id) {
      return gotoLocalVar(document, position, word);
    }

    // Search for the identifier and its declaration location, and goto it if found
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
