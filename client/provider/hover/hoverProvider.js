const vscode = require('vscode');
const path = require('path');
const matchUtils = require('../../utils/matchUtils');
const stringUtils = require('../../utils/stringUtils');
const searchUtils = require('../../utils/searchUtils');
const matchType = require('../../enum/MatchType');

const hoverProvider = function(context) {
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
          await buildGlobalVarHoverText(word, match, content); 
          break;
        case matchType.PROC_DECLARATION.id: case matchType.LABEL_DECLARATION.id: case matchType.QUEUE_DECLARATION.id: case matchType.TIMER_DECLARATION.id: case matchType.SOFTTIMER_DECLARATION.id:
          buildBlockDeclarationHoverText(word, prevWord, lineText, content); 
          break;
        case matchType.LABEL.id: case matchType.PROC.id: case matchType.QUEUE.id:
          await buildBlockReferenceHoverText(word, match, content); 
          break;
        case matchType.PARAM.id: case matchType.DBTABLE.id:
          await buildReferenceWithBodyHoverText(word, match, content);
          break;
        default: 
          buildDefaultHoverText(word, match, content);
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
    const line = stringUtils.getLineText(fileText.substring(match.index - 4));;
    displayText = line.substring(0, line.indexOf(";"));
  } else {
    const lineText = stringUtils.getLineText(fileText.substring(match.index));
    displayText = `input parameter (${lineText.substring(0, lineText.indexOf(word) + word.length)})`;
  }
  appendMarkdown(content, "LOCAL_VAR", displayText, "rs2");
}

async function buildConstantHoverText(word, content) {
  const results = await searchUtils.searchFiles(`^${word}`, ["constant"], 0, 1);
  if (results && results.length > 0) {
    appendMarkdown(content, "constant", results[0].text, "constant");
  }
}

async function buildGlobalVarHoverText(word, match, content) {
  const definition = `[${word}]`;
  const results = await searchUtils.searchFiles(definition, match.definitionFiles, 0, 1, searchUtils.textResult.remaining);
  const fileType = results.length > 0 ? results[0].location.uri.path.split(/[#?]/)[0].split('.').pop().trim() : 'varp';
  appendMarkdown(content, fileType, definition, fileType);
  appendBodyUntilEmptyLine(content, results[0].text, true, 1);
}

function buildBlockDeclarationHoverText(name, blockType, lineText, content) {
  appendMarkdown(content, blockType, name, "rs2");
  const split = lineText.split('(');
  if (split.length > 1 && split[1].length > 1) {
    appendMarkdownBody(content, `<b>params:</b> <i>${split[1].substring(0, split[1].indexOf(')'))}</i>`, true);
  }
  if (split.length > 2 && split[2].length > 1) {
    appendMarkdownBody(content, `<b>returns:</b> <i>${split[2].substring(0, split[2].indexOf(')'))}</i>`, split[1].length === 1);
  }
}

async function buildBlockReferenceHoverText(word, match, content) {
  const pattern = match.definitionFormat.replace("NAME", word);
  const offset = match.definitionFormat.indexOf("NAME");
  const results = await searchUtils.searchFiles(pattern, match.definitionFiles, offset, 1);
  if (results && results.length > 0) {
    buildBlockDeclarationHoverText(word, match.id, results[0].text, content);
  }
}

function buildDeclarationHoverText() {
  return;
}

function buildReferenceHoverText(word, match, content) {
  appendMarkdown(content, match.id, match.definitionFormat.replace("NAME", word), match.definitionFiles[0]);
}

async function buildReferenceWithBodyHoverText(word, match, content) {
  buildReferenceHoverText(word, match, content);
  const offset = match.definitionFormat.indexOf("NAME");
  const pattern = match.definitionFormat.replace("NAME", word);
  const results = await searchUtils.searchFiles(pattern, match.definitionFiles, offset, 1, searchUtils.textResult.remaining);
  if (results && results.length > 0) {
    appendBodyUntilEmptyLine(content, results[0].text, true, 1);
  }
}

function buildDefaultHoverText(word, match, content) {
  if (!match.definitionFormat) {
    buildDeclarationHoverText();
  } else {
    buildReferenceHoverText(word, match, content);
  }
}

function appendMarkdown(content, type, text, icon) {
  icon = icon || "rs2";
  content.appendMarkdown(`<img src="${icon}.png">&ensp;<b>${type.toUpperCase()}</b>&ensp;${text}`);
}

function appendLineBreak(content) {
  content.appendMarkdown('\n\n---');
}

function appendMarkdownBody(content, body, addLineBreak) {
  if (addLineBreak) {
    appendLineBreak(content);
  }
  content.appendMarkdown(`\n\n${body}`);
}

function appendBodyUntilEmptyLine(content, text, addLineBreak, startIndex) {
  addLineBreak = addLineBreak || false;
  startIndex = startIndex || 0;
  const lines = stringUtils.getLines(text);
  if (lines.length > startIndex) {
    if (addLineBreak) appendLineBreak(content);
    for (let i = startIndex; i < lines.length; i++) {
      if (!/\S/.test(lines[i]) || lines[i].startsWith("//")) break;
      appendMarkdownBody(content, lines[i]);
    }
  }
}

module.exports = hoverProvider;
