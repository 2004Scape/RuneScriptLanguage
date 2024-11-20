const vscode = require('vscode');
const fs = require('fs');
const stringUtils = require('../utils/stringUtils');
const responseText = require('../enum/responseText');

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
  return {
    "info": getInfo(match, fileText, index),
    "text": getReturnText(match, fileText, index),
    "location": new vscode.Location(fileUri, getPosition(fileText, index, lineIndexOffset))
  }
}

function getInfo(match, fileText, index) {
  if (!match.searchForInfo) return '';
  const prevLine = stringUtils.getPreviousLine(fileText.substring(0, index));
  let descIndex = prevLine.indexOf('desc:');
  descIndex = descIndex > 0 ? descIndex : prevLine.indexOf('info:');
  return (prevLine.startsWith('//') && descIndex >= 0) ? prevLine.substring(descIndex + 5).trim() : '';
}

function getReturnText(match, fileText, index) {
  switch(match.responseText) {
    case responseText.FULL: return fileText;
    case responseText.BLOCK: return stringUtils.getBlockText(fileText.substring(index), match);
    case responseText.LINE: return stringUtils.getLineText(fileText.substring(index));
    default: return '';
  }
}

function getPosition(fileText, index, lineIndexOffset) {
  const split = fileText.slice(0, index).split(/\r\n|\r|\n/g);
  const lineNum = split ? split.length - 1 : 0;
  const lineIndex = split[lineNum].length + lineIndexOffset;
  if (lineIndex < 0) return null;
  return new vscode.Position(lineNum, lineIndex);
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
