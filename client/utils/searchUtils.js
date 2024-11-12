const vscode = require('vscode');
const fs = require('fs');
const stringUtils = require('./stringUtils');
const responseText = require('../enum/responseText');

const exclusions = "{**​/node_modules/**,**/ref/**,**/public/**,**/pack/**,**/3rdparty/**,**/jagex2/**,**/lostcity/**}";

const findLocalVar = (fileText, word) => {
  const varKeyword = "(int|string|boolean|seq|locshape|component|idk|midi|npc_mode|namedobj|synth|stat|npc_stat|fontmetrics|enum|loc|model|npc|obj|player_uid|spotanim|npc_uid|inv|category|struct|dbrow|interface|dbtable|coord|mesanim|param|queue|weakqueue|timer|softtimer|char|dbcolumn|proc|label)\\b";
  const matches = [...fileText.matchAll(new RegExp(`${varKeyword} \\$${word}(,|;|=|\\)| ){1}`, "g"))];
  return matches[matches.length - 1];
}

const findDefinition = async function(word, match, fileUri) {
  if (!word || !match) return null;

  let files = [];
  if (fileUri) {
    files.push(fileUri);
  } else {
    let inclusions;
    if (match.fileName) {
      inclusions = `**/${match.fileName}`;
    } else {
      let inclusionsArr = [];
      match.definitionFiles.forEach(fileType => inclusionsArr.push(`**/*.${fileType}`));
      inclusions = `{${inclusionsArr.join(",")}}`;
    }
    files = await vscode.workspace.findFiles(inclusions, exclusions) || [];
  }

  let result;
  const pattern = match.definitionFormat.replace("NAME", word);
  files.some(fileUri => {
    const fileText = fs.readFileSync(fileUri.path, "utf8");
    const index = fileText.indexOf(pattern);
    if (index >= 0) {
      result = buildSearchResult(fileText, index, fileUri, match.responseText, match.definitionFormat.indexOf("NAME"));
      return true; //short circuit at 1 result
    }
  });
  return result;
}

function buildSearchResult(fileText, index, fileUri, textType, lineIndexOffset) {
  return {
    "text": getReturnText(textType, fileText, index),
    "location": new vscode.Location(fileUri, getPosition(fileText, index, lineIndexOffset))
  }
}

function getReturnText(textType, fileText, index) {
  switch(textType) {
    case responseText.FULL: return fileText;
    case responseText.BLOCK: return stringUtils.getBlockText(fileText.substring(index));
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

module.exports = { findLocalVar, findDefinition }
