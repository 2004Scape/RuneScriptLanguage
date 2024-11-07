const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const matchUtils = require('../../utils/matchUtils');
const matchType = require('../../enum/MatchType');

const runescriptHoverProvider = function(context) {
  return {
    async provideHover(document, position, token) {
      const { word, lineText, prevWord, match } = matchUtils.matchWord(document, position);
      if (!word) {
        return null;
      }

      const content = new vscode.MarkdownString();
      content.supportHtml = true;
      content.isTrusted = true;
      content.supportThemeIcons = true;
      content.baseUri = vscode.Uri.file(path.join(context.extensionPath, 'icons', path.sep)); 

      switch (match.id) {
        case matchType.LOCAL_VAR.id: 
          buildLocalVarHoverText(document, position, word, content); break;
        case matchType.CONSTANT.id: 
          await buildConstantHoverText(word, content); break;
        case matchType.GLOBAL_VAR.id: 
          await buildGlobalVarHoverText(word, content); break;
        case matchType.PROC_DECLARATION.id: case matchType.LABEL_DECLARATION.id: case matchType.QUEUE_DECLARATION.id: case matchType.TIMER_DECLARATION.id: case matchType.SOFTTIMER_DECLARATION.id:
          buildBlockDefinitionHoverText(word, prevWord, lineText, content);
        default: 
          buildDefaultHoverText(match, word, content);
      }

      if (content.value.length) {
        return new vscode.Hover(content);
      }
    }
  };
}

function buildLocalVarHoverText(document, position, word, content) {
  const varKeyword = "(int|string|boolean|seq|locshape|component|idk|midi|npc_mode|namedobj|synth|stat|npc_stat|fontmetrics|enum|loc|model|npc|obj|player_uid|spotanim|npc_uid|inv|category|struct|dbrow|interface|dbtable|coord|mesanim|param|queue|weakqueue|timer|softtimer|char|dbcolumn|proc|label)\\b";
  const fileText = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
  const matches = [...fileText.matchAll(new RegExp(`${varKeyword} \\$${word}(,|;|=|\\)| ){1}`, "g"))];
  const match = matches[matches.length - 1];
  const isDef = fileText.substring(Math.max(match.index - 4, 0), match.index) === "def_";
  let displayText;
  if (isDef) {
    displayText = getRestOfLineFromIndex(fileText, match.index - 4);
  } else {
    const lineText = getRestOfLineFromIndex(fileText, match.index);
    displayText = `input parameter (${lineText.substring(0, lineText.indexOf(word) + word.length)})`;
  }
  appendMarkdown(content, "LOCAL_VAR", displayText, "rs2");
}

async function buildConstantHoverText(word, content) {
  const exclude = "{**​/node_modules/**,**/ref/**,**/public/**,**/pack/**,**/3rdparty/**,**/jagex2/**,**/lostcity/**}";
  const files = await vscode.workspace.findFiles('**/*.constant', exclude);
  files.some(fileUri => {
    const fileText = fs.readFileSync(fileUri.path, "utf8");
    const index = fileText.indexOf(`^${word}`);
    if (index >= 0) {
      appendMarkdown(content, "constant", getRestOfLineFromIndex(fileText, index), "constant");
      return true;
    }
  });
}

async function buildGlobalVarHoverText(word, content) {
  const exclude = "{**​/node_modules/**,**/ref/**,**/public/**,**/pack/**,**/3rdparty/**,**/jagex2/**,**/lostcity/**}";
  const files = await vscode.workspace.findFiles('{**/*.varn,**/*.vars}', exclude);
  const definition = `[${word}]`;
  let fileType = 'varp';
  files.some(fileUri => {
    const fileText = fs.readFileSync(fileUri.path, "utf8");
    const index = fileText.indexOf(definition);
    if (index >= 0) {
      fileType = fileUri.path.split(/[#?]/)[0].split('.').pop().trim();
      return true;
    }
  });
  appendMarkdown(content, fileType, definition, fileType);
}

function buildBlockDefinitionHoverText(name, blockType, lineText, content) {
  appendMarkdown(content, blockType, name, "rs2");
  const split = lineText.split('(');
  if (split.length > 1 && split[1].length > 1) {
    content.appendMarkdown('\n---');
    content.appendMarkdown('\n<b>params:</b> <i>' + split[1].slice(0, -1) + '</i>\n');
  }
  if (split.length > 2 && split[2].length > 1) {
    if (split[1].length === 1) content.appendMarkdown('\n---');
    content.appendMarkdown('\n<b>returns:</b> <i>' + split[2].slice(0, -1) + '</i>\n');
  }
}

function buildDefaultHoverText(match, word, content) {
  if (!match || !match.definitionFormat || !match.definitionFiles) {
    return;
  }
  appendMarkdown(content, match.id, match.definitionFormat.replace("NAME", word), match.definitionFiles[0]);
}

function appendMarkdown(content, type, text, icon) {
  icon = icon || "rs2";
  content.appendMarkdown(`<img src="${icon}.png">&ensp;<b>${type.toUpperCase()}</b>&ensp;${text}\n`);
}

function getRestOfLineFromIndex(input, index) {
  const truncated = input.substring(index);
  const endOfLine = /\r\n|\r|\n/.exec(truncated);
  return truncated.substring(0, endOfLine.index);
}

module.exports = runescriptHoverProvider;
