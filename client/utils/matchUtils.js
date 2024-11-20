const matchType = require("../resource/matchType");
const stringUtils = require("../utils/stringUtils");
const { commands } = require("../resource/engineCommands");
const identifierSvc = require('../service/identifierSvc');
const runescriptTrigger = require("../resource/triggers");
const { configTags, regexTags } = require("../resource/configTags");
const { COORD } = require("../enum/regex");


const matchWord = async (document, position) => {
  const wordRange = document.getWordRangeAtPosition(position);
  if (!wordRange) {
    return returnDefault();
  }

  const word = document.getText(wordRange);
  const lineText = document.lineAt(position.line).text;
  if (lineText.startsWith('//') || word.match(/^\d+.?\d+$/) || word === 'null' || word.length <= 1) {
    return returnDefault(); // Ignore comments and numbers and null and single character words
  }

  const prevWord = getPrevWord(document, wordRange.start);
  const fileType = document.uri.path.split(/[#?]/)[0].split('.').pop().trim();
  const prevChar = wordRange.start.character > 0 ? lineText.charAt(wordRange.start.character - 1) : '';
  const nextChar = lineText.charAt(wordRange.end.character);

  let match = matchType.UNKNOWN;

  // check if word is coordinates
  if (COORD.test(word)) {
    match = reference(matchType.COORDINATES);
  }

  // try to find a match based on the character proceeding the word
  if (match.id === matchType.UNKNOWN.id) {
    switch (prevChar) {
      case '[': match = getOpenBracketMatchType(fileType); break;
      case ',': match = getCommaMatchType(prevWord, nextChar); break;
      case '^': match = getConstantMatchType(fileType); break;
      case '%': match = reference(matchType.GLOBAL_VAR); break;
      case '@': match = getAtMatchType(nextChar); break;
      case '~': match = reference(matchType.PROC); break;
      case '$': match = getLocalVarMatchType(prevWord); break;
      case '=': match = getEqualsMatchType(prevWord, fileType); break;
    }
  }

  // try to find a match in the list of command names
  if (match.id === matchType.UNKNOWN.id) {
    match = matchEngineCommand(word, prevChar, document);
  }

  // try to match parameters (possiblities: command, label, proc, or queue parameters)
  if (match.id === matchType.UNKNOWN.id) {
    match = await matchParameter(word, lineText, position.character);
  }

  // return default if no matches found
  if (match.id === matchType.UNKNOWN.id) {
    return returnDefault();
  }

  return {
    "word": word,
    "fileType": fileType,
    "prevChar": prevChar,
    "match": match
  }
}

function returnDefault() {
  return { "match": matchType.UNKNOWN }
}

function getPrevWord(document, position) {
  if (position.character < 2) {
    return null;
  }
  const prevWordPosition = position.translate(0, -2);
  const wordRange = document.getWordRangeAtPosition(prevWordPosition);
  if (!wordRange) {
    return null;
  }
  return document.getText(wordRange);
}

function getLocalVarMatchType(prevWord) {
  if (!prevWord) {
    return reference(matchType.LOCAL_VAR);
  }
  if (prevWord.startsWith("def_")) {
    prevWord = prevWord.substr(4);
  }
  const defKeyword = "\\b(int|string|boolean|seq|locshape|component|idk|midi|npc_mode|namedobj|synth|stat|npc_stat|fontmetrics|enum|loc|model|npc|obj|player_uid|spotanim|npc_uid|inv|category|struct|dbrow|interface|dbtable|coord|mesanim|param|queue|weakqueue|timer|softtimer|char|dbcolumn|proc|label)\\b";
  const match = prevWord.match(new RegExp(defKeyword));
  return !match ? reference(matchType.LOCAL_VAR) : declaration(matchType.LOCAL_VAR);
}

function getAtMatchType(nextChar) {
  return nextChar !== '@' ? reference(matchType.LABEL) : matchType.UNKNOWN
}

function getOpenBracketMatchType(fileType) {
  switch (fileType) {
    case "varp": case "varn": case "vars": return declaration(matchType.GLOBAL_VAR);
    case "obj": return declaration(matchType.OBJ);
    case "loc": return declaration(matchType.LOC);
    case "npc": return declaration(matchType.NPC);
    case "param": return declaration(matchType.PARAM);
    case "seq": return declaration(matchType.SEQ);
    case "struct": return declaration(matchType.STRUCT);
    case "dbrow": return declaration(matchType.DBROW);
    case "dbtable": return declaration(matchType.DBTABLE);
    case "enum": return declaration(matchType.ENUM);
    case "hunt": return declaration(matchType.HUNT);
    case "inv": return declaration(matchType.INV);
    case "spotanim": return declaration(matchType.SPOTANIM);
    case "idk": return declaration(matchType.IDK);
    case "mesanim": return declaration(matchType.MESANIM);
  }
  return matchType.UNKNOWN;
}

function getCommaMatchType(prevWord, nextChar) {
  if (prevWord === 'p') {
    return reference(matchType.MESANIM);
  }
  if (nextChar === ']') {
    const trigger = runescriptTrigger[prevWord.toUpperCase()];
    if (trigger) {
      return trigger.declaration ? declaration(trigger.match) : reference(trigger.match);
    }
  }
  return matchType.UNKNOWN;
}

function getEqualsMatchType(prevWord, fileType) {
  const prev = prevWord.toUpperCase();
  const configTag = configTags[prev];
  if (configTag) {
    return reference(configTag.match);
  }
  for (let regexTag of regexTags) {
    if (regexTag.fileTypes.includes(fileType) && regexTag.regex.test(prev)) {
      return reference(regexTag.match);
    }
  }
  return matchType.UNKNOWN;
}

function getConstantMatchType(fileType) {
	if (fileType === "constant") {
		return declaration(matchType.CONSTANT);
	}
	return reference(matchType.CONSTANT);
}

function matchEngineCommand(word, prevChar, document) {
  if (word in commands && prevChar !== '[') {
    return (document.uri.path.includes("engine.rs2")) ? declaration(matchType.COMMAND) : reference(matchType.COMMAND);
  }
  return matchType.UNKNOWN;
}

async function matchParameter(word, line, index) {
  if (line.substring(index).indexOf(')') === -1) {
    return matchType.UNKNOWN;
  }
  line = stringUtils.truncateMatchingParenthesis(line.substring(0, index));
  const openCount = (line.match(/\(/g) || []).length;
  const closeCount = (line.match(/\)/g) || []).length;
  const openingIndex = stringUtils.nthIndexOf(line, '(', openCount - closeCount);
  if (openingIndex < 0 || line.charAt(Math.max(0, openingIndex - 1)) === ']') {
    return matchType.UNKNOWN;
  }
  let name = (line.substring(0, openingIndex).match(/\(?[a-zA-Z_~@]+$/) || [])[0].replace(/^\(/, '');
  const paramIndex = (line.substring(openingIndex).match(/,/g) || []).length;

  let identifier;
  if (name === 'queue') {
    if (paramIndex < 2) {
      return matchType.UNKNOWN;
    }
    identifier = await identifierSvc.get(line.substring(openingIndex + 1, line.indexOf(',')), matchType.QUEUE);
  } else if (name.startsWith('@')) {
    identifier = await identifierSvc.get(name.substring(1), matchType.LABEL);
  } else if (name.startsWith('~')) {
    identifier = await identifierSvc.get(name.substring(1), matchType.PROC);
  } else {
    identifier = commands[name];
  }
  if (!identifier || !identifier.signature || identifier.signature.params.length <= paramIndex) {
    return matchType.UNKNOWN;
  }
  return reference(matchType[identifier.signature.params[paramIndex].matchTypeId]);
}

function reference(type) {
  return { ...type, declaration: false };
}

function declaration(type) {
  return { ...type, declaration: true };
}

module.exports = { matchWord };
