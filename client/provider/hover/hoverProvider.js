const vscode = require('vscode');
const path = require('path');
const matchUtils = require('../../utils/matchUtils');
const stringUtils = require('../../utils/stringUtils');
const searchUtils = require('../../utils/searchUtils');
const matchType = require('../../enum/MatchType');

const hoverProvider = function(context) {
  return {
    async provideHover(document, position, token) {
      const { word, lineText, fileType, match } = matchUtils.matchWord(document, position);
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
          buildLocalVarHoverText(document, position, word, match, content); 
          break;
        case matchType.CONSTANT.id: 
          await buildConstantHoverText(word, match, content); 
          break;
        case matchType.GLOBAL_VAR.id: 
          await buildGlobalVarHoverText(word, match, fileType, content); 
          break;
        case matchType.PROC.id: case matchType.LABEL.id: case matchType.QUEUE.id: case matchType.TIMER.id: case matchType.SOFTTIMER.id:
          await buildBlockHoverText(word, match, lineText, content); 
          break;
        case matchType.ENUM.id:
          await buildEnumHoverText(word, match, content);
          break;
        default: 
          await buildDefaultHoverText(word, match, content);
      }

      if (content.value.length) {
        return new vscode.Hover(content);
      }
    }
  };
}

function buildLocalVarHoverText(document, position, word, match, content) {
  let displayText = '';
  if (match.declaration === false) {
    const fileText = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
    const match = searchUtils.searchLocalVar(fileText, word);
    const isDef = fileText.substring(Math.max(match.index - 4, 0), match.index) === "def_";
    if (isDef) {
      const line = stringUtils.getLineText(fileText.substring(match.index - 4));;
      displayText = line.substring(0, line.indexOf(";"));
    } else {
      const lineText = stringUtils.getLineText(fileText.substring(match.index));
      displayText = `input parameter (${lineText.substring(0, lineText.indexOf(word) + word.length)})`;
    }
  }
  appendMarkdown(content, "LOCAL_VAR", displayText, "rs2");
}

async function buildConstantHoverText(word, match, content) {
  if (match.declaration) {
    appendMarkdown(content, "constant", word, "constant");
  } else {
    const results = await searchUtils.searchFiles(`^${word}`, ["constant"], 0, 1);
    if (results && results.length > 0) {
      appendMarkdown(content, "constant", results[0].text, "constant");
    }
  }
}

async function buildGlobalVarHoverText(word, match, fileType, content) {
  let results;
  const pattern = match.definitionFormat.replace("NAME", word);
  if (match.declaration === false && match.previewDeclaration === true) {
    results = await searchUtils.searchFiles(pattern, match.definitionFiles, 0, 1, searchUtils.textResult.remaining);
    fileType = results.length > 0 ? results[0].location.uri.path.split(/[#?]/)[0].split('.').pop().trim() : 'varp';
  }
  appendMarkdown(content, fileType, pattern, fileType);
  if (results && results.length > 0) {
    appendBodyUntilEmptyLine(content, results[0].text, true, 1);
  }
}

async function buildBlockHoverText(word, match, lineText, content) {
  appendMarkdown(content, match.id, word, match.definitionFiles[0]);
  let line = lineText;
  if (match.declaration === false && match.previewDeclaration === true) {
    const results = await searchUtils.searchFiles(match.definitionFormat.replace("NAME", word), match.definitionFiles, 0, 1);
    if (results && results.length > 0) {
      line = results[0].text;
    }
  }
  if (match.previewDeclaration === true) {
    const split = line.split('(');
    if (split.length > 1 && split[1].length > 1) {
      appendMarkdownBody(content, `<b>params:</b> <i>${split[1].substring(0, split[1].indexOf(')'))}</i>`, true);
    }
    if (split.length > 2 && split[2].length > 1) {
      appendMarkdownBody(content, `<b>returns:</b> <i>${split[2].substring(0, split[2].indexOf(')'))}</i>`, split[1].length === 1);
    }
  }
}

async function buildEnumHoverText(word, match, content) {
  appendMarkdown(content, match.id, match.definitionFormat.replace("NAME", word), match.definitionFiles[0]);
  if (!match.declaration && match.previewDeclaration) {
    const pattern = match.definitionFormat.replace("NAME", word);
    const results = await searchUtils.searchFiles(pattern, match.definitionFiles, 0, 1, searchUtils.textResult.remaining);
    if (results && results.length > 0) {
      results[0].text = results[0].text.replace("inputtype=", "Input type: ");
      results[0].text = results[0].text.replace("outputtype=", "Output type: ");
      appendBodyUntilEmptyLine(content, results[0].text, true, 1, "val");
    }
  }
}

async function buildDefaultHoverText(word, match, content) {
  appendMarkdown(content, match.id, match.definitionFormat.replace("NAME", word), match.definitionFiles[0]);
  if (!match.declaration && match.previewDeclaration) {
    const pattern = match.definitionFormat.replace("NAME", word);
    const results = await searchUtils.searchFiles(pattern, match.definitionFiles, 0, 1, searchUtils.textResult.remaining);
    if (results && results.length > 0) {
      appendBodyUntilEmptyLine(content, results[0].text, true, 1);
    }
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

function appendBodyUntilEmptyLine(content, text, addLineBreak, startIndex, terminatingText) {
  terminatingText = terminatingText || '123';
  addLineBreak = addLineBreak || false;
  startIndex = startIndex || 0;
  const lines = stringUtils.getLines(text);
  if (lines.length > startIndex) {
    if (addLineBreak) appendLineBreak(content);
    for (let i = startIndex; i < lines.length; i++) {
      if (!/\S/.test(lines[i]) || lines[i].startsWith("//") || lines[i].startsWith(terminatingText)) break;
      appendMarkdownBody(content, lines[i]);
    }
  }
}

module.exports = hoverProvider;
