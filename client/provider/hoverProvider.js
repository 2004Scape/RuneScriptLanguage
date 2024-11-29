const vscode = require('vscode');
const path = require('path');
const stringUtils = require('../utils/stringUtils');
const searchSvc = require('../service/searchSvc');
const matchType = require('../matching/matchType');
const identifierSvc = require('../service/identifierSvc');
const identifierFactory = require('../resource/identifierFactory');
const { TITLE, INFO, VALUE, SIGNATURE, CODEBLOCK } = require('../enum/hoverDisplay');
const { matchWordFromDocument } = require('../matching/matchWord');

const hoverProvider = function(context) {
  return {
    async provideHover(document, position, token) {
      const { word, match } = await matchWordFromDocument(document, position);
      if (!match || match.noop) {
        return null;
      }

      const content = new vscode.MarkdownString();
      content.supportHtml = true;
      content.isTrusted = true;
      content.supportThemeIcons = true;
      content.baseUri = vscode.Uri.file(path.join(context.extensionPath, 'icons', path.sep)); 

      // Local vars are handled differently than the rest
      if (match.id === matchType.LOCAL_VAR.id) {
        appendLocalVarHoverText(document, position, word, match, content);
        return new vscode.Hover(content);
      }

      // If no config found, or no items to display then exit early
      const config = (match.declaration) ? match.declarationConfig : match.referenceConfig;
      if (!config || config.displayItems.length === 0) {
        return null;
      }

      // If we only need to show title, then set the identifier as hover only to prevent unnecessary file search
      if (config.displayItems.length === 1 && config.displayItems[0] === TITLE) {
        match.hoverOnly = true;
      }

      // Build hover text based on identifier data
      const identifier = await getIdentifier(word, match, document, position);
      if (!identifier || identifier.hideDisplay) {
        return null;
      }
      appendTitle(identifier.name, identifier.fileType, identifier.matchId, content);
      appendInfo(identifier, config.displayItems, content);
      appendValue(identifier, config.displayItems, content);
      appendSignature(identifier, config.displayItems, content);
      appendCodeBlock(identifier, config.displayItems, content);
      return new vscode.Hover(content);
    }
  };
}

function appendLocalVarHoverText(document, position, word, match, content) {
  appendTitle(word, match.declarationConfig.fileTypes[0], match.id, content);
  if (match.declaration === false) {
    const fileText = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
    const match = searchSvc.findLocalVar(fileText, word);
    const isDef = fileText.substring(Math.max(match.index - 4, 0), match.index) === "def_";
    if (isDef) {
      const line = stringUtils.getLineText(fileText.substring(match.index - 4));
      content.appendCodeblock(line.substring(0, line.indexOf(";")), 'runescript');
    } else {
      const lineText = stringUtils.getLineText(fileText.substring(match.index));
      content.appendCodeblock(`parameter: ${lineText.substring(0, lineText.indexOf(word) + word.length)}`, 'runescript');
    }
  }
}

function appendTitle(name, type, matchId, content) {
  content.appendMarkdown(`<img src="${type}.png">&ensp;<b>${matchId}</b>&ensp;${name}`);
}

function appendInfo(identifier, displayItems, content) {
  if (displayItems.includes(INFO) && identifier.info) {
    appendBody(`<i>${identifier.info}</i>`, content);
  }
}

function appendValue(identifier, displayItems, content) {
  if (displayItems.includes(VALUE) && identifier.value) {
    appendBody(`${identifier.value}`, content);
  }
}

function appendSignature(identifier, displayItems, content) {
  if (displayItems.includes(SIGNATURE) && identifier.signature) {
    if (identifier.signature.paramsText.length > 0) content.appendCodeblock(`params: ${identifier.signature.paramsText}`, identifier.language);
    if (identifier.signature.returns.length > 0) content.appendCodeblock(`returns: ${identifier.signature.returns}`, identifier.language);
  }
}

function appendCodeBlock(identifier, displayItems, content) {
  if (displayItems.includes(CODEBLOCK) && identifier.block) {
    content.appendCodeblock(identifier.block, identifier.language);
  }
}

function appendBody(text, content) {
  if (!content.value.includes('---')) {
    content.appendMarkdown('\n\n---');
  }
  content.appendMarkdown(`\n\n${text}`);
}

async function getIdentifier(word, match, document, position) {
  if (match.hoverOnly) {
    return identifierFactory.build(word, match, new vscode.Location(document.uri, position));
  }
  return await identifierSvc.get(word, match, match.declaration ? document.uri : null);
}

module.exports = hoverProvider;
