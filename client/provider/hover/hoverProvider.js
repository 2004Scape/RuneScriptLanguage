const vscode = require('vscode');
const path = require('path');
const matchUtils = require('../../utils/matchUtils');
const stringUtils = require('../../utils/stringUtils');
const searchUtils = require('../../utils/searchUtils');
const matchType = require('../../enum/MatchType');
const { commands } = require('../../resource/engineCommands');
const bodyFormat = require('../../enum/BodyFormat');
const identifierSvc = require('../../resource/identifierSvc');

const hoverProvider = function(context) {
  return {
    async provideHover(document, position, token) {
      const { word, fileType, prevChar, match } = await matchUtils.matchWord(document, position);
      if (!word) {
        return null;
      }

      const uri = document.uri;
      const content = new vscode.MarkdownString();
      content.supportHtml = true;
      content.isTrusted = true;
      content.supportThemeIcons = true;
      content.baseUri = vscode.Uri.file(path.join(context.extensionPath, 'icons', path.sep)); 

      switch (match.id) {
        case matchType.LOCAL_VAR.id: buildLocalVarHoverText(document, position, word, match, content); break;
        case matchType.COMMAND.id: buildCommandHoverText(word, match, content); break;
        default:
          const format = (match.declaration) ? match.declarationBodyFormat : match.referenceBodyFormat;
          switch(format) {
            case bodyFormat.SIGNATURE: await buildSignatureHoverText(word, match, uri, content); break;
            case bodyFormat.BLOCK: await buildBlockHoverText(word, match, uri, content); break;
            case bodyFormat.VALUE: await buildValueHoverText(word, match, uri, content); break;
            default: appendTitle(word, match, content, (match.id === matchType.GLOBAL_VAR.id) ? fileType : null);
          }
      }

      if (prevChar === ',' && word.startsWith('_')) {
        const searchableString = createSearchableString(`category=${word.substring(1)}`, `category=${word.substring(1)}`, searchUtils.getInclusionFiles(match));
        const infoText = `the underscore indicates this refers to any ${match.id.toLowerCase()} with <b>${searchableString}</b>`;
        appendBodyWithLabel(infoText, "info", content);
      }

      if (content.value.length) {
        return new vscode.Hover(content);
      }
    }
  };
}

function buildLocalVarHoverText(document, position, word, match, content) {
  appendTitle(word, match, content);
  if (match.declaration === false) {
    const fileText = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
    const match = searchUtils.findLocalVar(fileText, word);
    const isDef = fileText.substring(Math.max(match.index - 4, 0), match.index) === "def_";
    if (isDef) {
      const line = stringUtils.getLineText(fileText.substring(match.index - 4));;
      appendBody(line.substring(0, line.indexOf(";")), content);
    } else {
      const lineText = stringUtils.getLineText(fileText.substring(match.index));
      appendBody(`input parameter (${lineText.substring(0, lineText.indexOf(word) + word.length)})`, content);
    }
  }
}

function buildCommandHoverText(word, match, content) {
  const command = commands[word];
  if (match.declaration || !command) {
    return;
  }
  appendTitle(`${word} (${command.value})`, match, content);
  appendSignature(command, content);
}

async function buildSignatureHoverText(word, match, uri, content) {
  const identifier = await getIdentifier(word, match, uri);
  if (identifier) {
    appendTitle(word, match, content);
    appendSignature(identifier, content);
  }
}

async function buildBlockHoverText(word, match, uri, content) {
  const identifier = await getIdentifier(word, match, uri);
  if (identifier) {
    const typeOverride = (match.id === matchType.GLOBAL_VAR.id) ? identifier.value : null; // differentiate global var type
    appendTitle(word, match, content, typeOverride); 
    appendBlock(identifier, content);
  }
}

async function buildValueHoverText(word, match, uri, content) {
  const identifier = await getIdentifier(word, match, uri);
  if (identifier) {
    appendTitle(word, match, content); 
    appendValue(identifier, content);
  }
}

function appendSignature(identifier, content) {
  if (identifier.description.length > 0) {
    appendBodyWithLabel(identifier.description, "desc", content);
  }
  if (identifier.paramsText.length > 0) {
    appendBodyWithLabel(identifier.paramsText, "params", content);
  }
  if (identifier.returns.length > 0) {
    appendBodyWithLabel(identifier.returns, "returns", content);
  }
}

function appendBlock(identifier, content, terminatingText) {
  terminatingText = terminatingText || '123';
  const startIndex = 1;
  const lines = stringUtils.getLines(identifier.block);
  if (lines.length > startIndex) {
    for (let i = startIndex; i < lines.length; i++) {
      if (!/\S/.test(lines[i]) || lines[i].startsWith(terminatingText)) break;
      appendBody(lines[i], content);
    }
  }
}

function appendValue(identifier, content) {
  if (identifier.value.length > 0) {
    appendBodyWithLabel(identifier.value, "value", content);
  }
}

function appendTitle(text, match, content, typeOverride) {
  if (typeOverride) {
    content.appendMarkdown(`<img src="${typeOverride}.png">&ensp;<b>${typeOverride.toUpperCase()}</b>&ensp;${text}`);
  } else {
    content.appendMarkdown(`<img src="${match.definitionFiles[0]}.png">&ensp;<b>${match.id.toUpperCase()}</b>&ensp;${text}`);
  }
}

function appendBody(text, content) {
  if (!content.value.includes('---')) {
    content.appendMarkdown('\n\n---');
  }
  content.appendMarkdown(`\n\n${text}`);
}

function appendBodyWithLabel(text, label, content) {
  appendBody(`<b>${label}:</b> <i>${text}</i>`, content);
}

function createSearchableString(linkableText, query, filesToInclude, isRegex=false) {
  const searchOptions = JSON.stringify({ query: query, filesToInclude: filesToInclude, isRegex: isRegex});
  return `[${linkableText}](${vscode.Uri.parse(`command:workbench.action.findInFiles?${encodeURIComponent(searchOptions)}`)})`;
}

async function getIdentifier(word, match, uri) {
  return (match.declaration) ? 
    await identifierSvc.get(word, match, uri) : 
    await identifierSvc.get(word, match);
}

module.exports = hoverProvider;
