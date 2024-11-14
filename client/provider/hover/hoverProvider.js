const vscode = require('vscode');
const path = require('path');
const matchUtils = require('../../utils/matchUtils');
const stringUtils = require('../../utils/stringUtils');
const searchSvc = require('../../service/searchSvc');
const matchType = require('../../enum/MatchType');
const { commands } = require('../../resource/engineCommands');
const bodyFormat = require('../../enum/BodyFormat');
const identifierSvc = require('../../service/identifierSvc');

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

      // todo - instead of this, add a new matcher for these 
      if (prevChar === ',' && word.startsWith('_')) {
        const searchableString = createSearchableString(`category=${word.substring(1)}`, `category=${word.substring(1)}`, searchSvc.getInclusionFiles(match));
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
    const match = searchSvc.findLocalVar(fileText, word);
    const isDef = fileText.substring(Math.max(match.index - 4, 0), match.index) === "def_";
    if (isDef) {
      const line = stringUtils.getLineText(fileText.substring(match.index - 4));
      appendCodeBlock(line.substring(0, line.indexOf(";")), match, content);
    } else {
      const lineText = stringUtils.getLineText(fileText.substring(match.index));
      appendCodeBlock(`parameter: ${lineText.substring(0, lineText.indexOf(word) + word.length)}`, match, content);
    }
  }
}

function buildCommandHoverText(word, match, content) {
  const command = commands[word];
  if (match.declaration || !command) {
    return;
  }
  appendTitle(`${word} (${command.value})`, match, content);
  appendDescription(command, content);
  appendSignature(command, match, content);
}

async function buildSignatureHoverText(word, match, uri, content) {
  const identifier = await getIdentifier(word, match, uri);
  if (identifier) {
    appendTitle(word, match, content);
    appendDescription(identifier, content);
    appendSignature(identifier, match, content);
  }
}

async function buildBlockHoverText(word, match, uri, content) {
  const identifier = await getIdentifier(word, match, uri);
  if (identifier) {
    const typeOverride = (match.id === matchType.GLOBAL_VAR.id) ? identifier.value : null; // differentiate global var type
    appendTitle(word, match, content, typeOverride); 
    appendDescription(identifier, content);
    if (identifier.block.length > 0) appendCodeBlock(stringUtils.skipFirstLine(identifier.block), match, content);
  }
}

async function buildValueHoverText(word, match, uri, content) {
  const identifier = await getIdentifier(word, match, uri);
  if (identifier) {
    appendTitle(word, match, content); 
    appendDescription(identifier, content);
    if (identifier.value.length > 0) appendCodeBlock(`${identifier.value}`, match, content);
  }
}

function appendSignature(identifier, match, content) {
  if (identifier.paramsText.length > 0) {
    appendCodeBlock(`params: ${identifier.paramsText}`, match, content);
  }
  if (identifier.returns.length > 0) {
    appendCodeBlock(`returns: ${identifier.returns}`, match, content);
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
  appendBody(`${label}: <i>${text}</i>`, content);
}

function appendCodeBlock(codeBlock, match, content) {
  content.appendCodeblock(codeBlock, match.language);
}

function createSearchableString(linkableText, query, filesToInclude, isRegex=false) {
  const searchOptions = JSON.stringify({ query: query, filesToInclude: filesToInclude, isRegex: isRegex});
  return `[${linkableText}](${vscode.Uri.parse(`command:workbench.action.findInFiles?${encodeURIComponent(searchOptions)}`)})`;
}

function appendDescription(identifier, content) {
  if (identifier && identifier.description.length > 0) {
    appendBody(`<i>${identifier.description}</i>`, content);
  }
}

async function getIdentifier(word, match, uri) {
  return (match.declaration) ? 
    await identifierSvc.get(word, match, uri) : 
    await identifierSvc.get(word, match);
}

module.exports = hoverProvider;
