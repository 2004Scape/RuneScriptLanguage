const vscode = require('vscode');
const path = require('path');
const matchUtils = require('../../utils/matchUtils');
const stringUtils = require('../../utils/stringUtils');
const searchUtils = require('../../utils/searchUtils');
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
          buildLocalVarHoverText(document, position, word, content); 
          break;
        case matchType.CONSTANT.id: 
          await buildConstantHoverText(word, content); 
          break;
        case matchType.GLOBAL_VAR.id: 
          await buildGlobalVarHoverText(word, content); 
          break;
        case matchType.PROC_DECLARATION.id: case matchType.LABEL_DECLARATION.id: case matchType.QUEUE_DECLARATION.id: case matchType.TIMER_DECLARATION.id: case matchType.SOFTTIMER_DECLARATION.id:
          buildBlockDefinitionHoverText(word, prevWord, lineText, content); 
          break;
        case matchType.LABEL.id: case matchType.PROC.id: case matchType.QUEUE.id:
          await buildBlockReferenceHoverText(word, match, content); 
          break;
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
  const fileText = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
  const match = searchUtils.searchLocalVar(fileText, word);
  const isDef = fileText.substring(Math.max(match.index - 4, 0), match.index) === "def_";
  let displayText;
  if (isDef) {
    displayText = stringUtils.getLineText(fileText.substring(match.index - 4));
  } else {
    const lineText = stringUtils.getLineText(fileText.substring(match.index));
    displayText = `input parameter (${lineText.substring(0, lineText.indexOf(word) + word.length)})`;
  }
  appendMarkdown(content, "LOCAL_VAR", displayText, "rs2");
}

async function buildConstantHoverText(word, content) {
  const results = await searchUtils.searchFiles(`^${word}`, ["constant"], 0, 1);
  if (results && results.length > 0) {
    appendMarkdown(content, "constant", results[0].lineText, "constant");
  }
}

async function buildGlobalVarHoverText(word, content) {
  const definition = `[${word}]`;
  const results = await searchUtils.searchFiles(definition, ["varn", "vars"], 0, 1);
  const fileType = results.length > 0 ? results[0].location.uri.path.split(/[#?]/)[0].split('.').pop().trim() : 'varp';
  appendMarkdown(content, fileType, definition, fileType);
}

function buildBlockDefinitionHoverText(name, blockType, lineText, content) {
  appendMarkdown(content, blockType, name, "rs2");
  const split = lineText.split('(');
  if (split.length > 1 && split[1].length > 1) {
    content.appendMarkdown('\n---');
    content.appendMarkdown('\n<b>params:</b> <i>' + split[1].substring(0, split[1].indexOf(')')) + '</i>\n');
  }
  if (split.length > 2 && split[2].length > 1) {
    if (split[1].length === 1) content.appendMarkdown('\n---');
    content.appendMarkdown('\n<b>returns:</b> <i>' + split[2].substring(0, split[2].indexOf(')'))  + '</i>\n');
  }
}

async function buildBlockReferenceHoverText(word, match, content) {
  const pattern = match.definitionFormat.replace("NAME", word);
  const offset = match.definitionFormat.indexOf("NAME");
  const results = await searchUtils.searchFiles(pattern, match.definitionFiles, offset, 1);
  if (results && results.length > 0) {
    buildBlockDefinitionHoverText(word, match.id, results[0].lineText, content);
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

module.exports = runescriptHoverProvider;
