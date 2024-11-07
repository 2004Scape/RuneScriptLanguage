const vscode = require('vscode');
const fs = require('fs');
const stringUtils = require('./stringUtils');

const searchFile = async function(pattern, fileName, lineIndexOffset) {
  const files = await vscode.workspace.findFiles(`**/${fileName}`);
  const fileText = fs.readFileSync(files[0].path, "utf8");
  const idx = fileText.indexOf(pattern);
  if (idx < 0) {
    return null;
  }
  return new vscode.Location(files[0], getPosition(fileText, idx, lineIndexOffset));
}

const searchFiles = async function(pattern, fileTypes, lineIndexOffset, limit) {
  // Might want to switch to findTextInFiles when released https://github.com/microsoft/vscode/issues/59921#issuecomment-2231630101
  limit = limit || 20;
  lineIndexOffset = lineIndexOffset || 0;
  let inclusions = [];
  fileTypes.forEach(fileType => inclusions.push(`**/*.${fileType}`));
  const exclude = "{**​/node_modules/**,**/ref/**,**/public/**,**/pack/**,**/3rdparty/**,**/jagex2/**,**/lostcity/**}";
  const files = await vscode.workspace.findFiles('{' + inclusions.join(",") + '}', exclude);

  let results = [];
  files.some(fileUri => {
    const fileText = fs.readFileSync(fileUri.path, "utf8");
    const idx = fileText.indexOf(pattern);
    if (idx >= 0) {
      results.push({
        "lineText": stringUtils.getLineText(fileText.substring(idx)),
        "location": new vscode.Location(fileUri, getPosition(fileText, idx, lineIndexOffset))
      });
      return results.length === limit; // short circuit when result limit is reached
    }
  });
  return results;
}

const searchLocalVar = (fileText, word) => {
  const varKeyword = "(int|string|boolean|seq|locshape|component|idk|midi|npc_mode|namedobj|synth|stat|npc_stat|fontmetrics|enum|loc|model|npc|obj|player_uid|spotanim|npc_uid|inv|category|struct|dbrow|interface|dbtable|coord|mesanim|param|queue|weakqueue|timer|softtimer|char|dbcolumn|proc|label)\\b";
  const matches = [...fileText.matchAll(new RegExp(`${varKeyword} \\$${word}(,|;|=|\\)| ){1}`, "g"))];
  return matches[matches.length - 1];
}

function getPosition(fileText, index, lineIndexOffset) {
  const split = fileText.slice(0, index).split(/\r\n|\r|\n/g);
  const lineNum = split ? split.length - 1 : 0;
  const lineIndex = split[lineNum].length + lineIndexOffset;
  return new vscode.Position(lineNum, lineIndex);
}

module.exports = { searchFile, searchFiles, searchLocalVar }