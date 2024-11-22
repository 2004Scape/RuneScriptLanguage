const vscode = require('vscode');
const fs = require('fs');
const stringUtils = require('../utils/stringUtils');

const findLocalVar = (fileText, word) => {
  const varKeyword = "(int|string|boolean|seq|locshape|component|idk|midi|npc_mode|namedobj|synth|stat|npc_stat|fontmetrics|enum|loc|model|npc|obj|player_uid|spotanim|npc_uid|inv|category|struct|dbrow|interface|dbtable|coord|mesanim|param|queue|weakqueue|timer|softtimer|char|dbcolumn|proc|label)\\b";
  const matches = [...fileText.matchAll(new RegExp(`${varKeyword} \\$${word}(,|;|=|\\)| ){1}`, "g"))];
  return matches[matches.length - 1];
}

const findDeclaration = async function(word, match, fileUri) {
  if (!word || !match) return null;

  // If you pass in fileUri, no workspace search is performed 
  const files = (fileUri) ? [fileUri] : await vscode.workspace.findFiles(getInclusionFiles(match)) || [];

  let result;
  const pattern = match.declarationConfig.format.replace("NAME", word);
  files.some(fileUri => {
    const fileText = fs.readFileSync(fileUri.path, "utf8");
    const index = fileText.indexOf(pattern);
    if (index >= 0) {
      result = buildSearchResult(fileText, index, fileUri, match, match.declarationConfig.format.indexOf("NAME"));
      return true; //short circuit at 1 result
    }
  });
  return result;
}

function buildSearchResult(fileText, index, fileUri, match, lineIndexOffset) {
  const declarationBlock = stringUtils.getBlockText(fileText.substring(index), match);
  const linesToIndex = stringUtils.getLines(fileText.slice(0, index));
  const lineNum = linesToIndex ? linesToIndex.length - 1 : 0;
  const lineIndex = linesToIndex[lineNum].length + lineIndexOffset;
  return {
    "info": getInfo(linesToIndex[linesToIndex.length - 2] || '', index),
    "text": declarationBlock,
    "location": new vscode.Location(fileUri, (lineIndex >= 0) ? new vscode.Position(lineNum, lineIndex) : null)
  }
}

function getInfo(line) {
  let infoIndex = line.indexOf('info:');
  infoIndex = infoIndex > 0 ? infoIndex : line.indexOf('desc:');
  return (line.startsWith('//') && infoIndex >= 0) ? line.substring(infoIndex + 5).trim() : '';
}

function getInclusionFiles(match) {
  if (!match) return null;
  if (match.declarationConfig.file) { // If matchType has a definitionFile defined, only that file will be searched for
    return `**/${match.declarationConfig.file}`;
  } else {
    let inclusionsArr = []; // Otherwise, will serach all file types as defined by matchType.definitionFiles 
    match.declarationConfig.fileTypes.forEach(fileType => inclusionsArr.push(`**/*.${fileType}`));
    return `{${inclusionsArr.join(",")}}`;
  }
}

module.exports = { findLocalVar, findDeclaration, getInclusionFiles };
