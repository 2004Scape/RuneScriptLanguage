const vscode = require('vscode');
const matchUtils = require('../../utils/matchUtils');
const searchUtils = require('../../utils/searchUtils');
const matchType = require('../../enum/MatchType');

const runescriptDefinitionProvider = {
  async provideDefinition(document, position, token) {
    const { word, match } = matchUtils.matchWord(document, position);
    if (!word) {
      return null;
    }

    switch (match.id) {
      case matchType.LOCAL_VAR.id: return gotoLocalVar(document, position, word);
      case matchType.INTERFACE.id: return gotoInterface(match, word);
      default: return await gotoDefinition(match, word);
    }
  }
}

const gotoLocalVar = (document, position, word) => {
  const fileText = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
  const match = searchUtils.searchLocalVar(fileText, word);
  return !match ? null : new vscode.Location(document.uri, document.positionAt(match.index).translate(0, match[1].length + 1));
}

const gotoInterface = async (match, word) => {
  if (!match || !match.definitionFiles || !match.definitionFormat) {
    return null;
  }
  return searchUtils.searchFile(match.definitionFormat.replace("NAME", word), "interface.pack", 0);
}

const gotoDefinition = async (match, word) => {
  if (!match || !match.definitionFiles || !match.definitionFormat) {
    return null;
  }
  const pattern = match.definitionFormat.replace("NAME", word);
  const offset = match.definitionFormat.indexOf("NAME");
  const results = await searchUtils.searchFiles(pattern, match.definitionFiles, offset, 1);
  return (!results || results.length === 0) ? null : results[0].location;
}

module.exports = runescriptDefinitionProvider;
