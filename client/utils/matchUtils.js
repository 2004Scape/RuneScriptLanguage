const matchType = require("../enum/MatchType");
const stringUtils = require("../utils/stringUtils");
const { commands } = require("../resource/engineCommands");

const matchWord = (document, position) => {
  const wordRange = document.getWordRangeAtPosition(position);
  if (!wordRange) {
    return returnDefault();
  }

  const word = document.getText(wordRange);
  const lineText = document.lineAt(position.line).text;
  if (lineText.startsWith('//') || word.match(/^\d+.?\d+$/) || word === 'null') {
    return returnDefault(); // Ignore comments and numbers and null
  }

  const prevWord = getPrevWord(document, wordRange.start);
  const fileType = document.uri.path.split(/[#?]/)[0].split('.').pop().trim();
  const identifier = wordRange.start.character > 0 ? lineText.charAt(wordRange.start.character - 1) : '';

  // try to find a match based on the character proceeding the word
  let match = matchType.UNKNOWN;
    switch (identifier) {
    case '[': match = getOpenBracketMatchType(fileType); break;
    case ',': match = getCommaMatchType(prevWord); break;
    case '^': match = getConstantMatchType(fileType); break;
    case '%': match = reference(matchType.GLOBAL_VAR); break;
    case '@': match = reference(matchType.LABEL); break;
    case '~': match = reference(matchType.PROC); break;
    case '$': match = getLocalVarMatchType(prevWord); break;
    case '=': match = getEqualsMatchType(prevWord); break;
  }

  // try to find a match in the list of command names
  if (match.id === matchType.UNKNOWN.id) {
    match = matchEngineCommand(word, identifier, document);
  }

  // try to match parameters (possiblities: command, label, proc, or queue parameters)
  if (match.id === matchType.UNKNOWN.id) {
    match = matchParameter(word, lineText, position.character);
  }

  // return default if no matches found
  if (match.id === matchType.UNKNOWN.id) {
    return returnDefault();
  }

  return {
    "word": word,
    "fileType": fileType,
    "prevWord": prevWord,
    "identifier": identifier,
    "lineText": lineText,
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

function getCommaMatchType(prevWord) {
  switch (prevWord) {
    case "proc": return declaration(matchType.PROC);
    case "label": return declaration(matchType.LABEL);
    case "queue": return declaration(matchType.QUEUE);
    case "timer": return declaration(matchType.TIMER);
    case "softtimer": return declaration(matchType.SOFTTIMER);
    case "walktrigger": return declaration(matchType.WALKTRIGGER);
    case "opplayeru": case "applayeru": return reference(matchType.OBJ);
    case "opnpct": case "opplayert": case "apnpct": case "applayert": return reference(matchType.INTERFACE);
    case "p": return reference(matchType.MESANIM);
  }
  switch (prevWord.substring(0, Math.min(5, prevWord.length))) {
    case "oploc": case "aploc": return reference(matchType.LOC);
    case "ophel": case "opobj": return reference(matchType.OBJ);
    case "opnpc": case "ai_qu": case "ai_ap": case "ai_ti": return reference(matchType.NPC);
  }
  return matchType.UNKNOWN;
}

function getEqualsMatchType(prevWord) {
  switch (prevWord) {
    case "param": return reference(matchType.PARAM);
    case "table": return reference(matchType.DBTABLE);
    case "huntmode": return reference(matchType.HUNT);
    case "anim": case "readyanim": case "walkanim": return reference(matchType.SEQ);
  }
  return matchType.UNKNOWN;
}

function getConstantMatchType(fileType) {
	if (fileType === "constant") {
		return declaration(matchType.CONSTANT);
	}
	return reference(matchType.CONSTANT);
}

function matchEngineCommand(word, identifier, document) {
  if (word in commands && identifier !== '[') {
    return (document.uri.path.includes("engine.rs2")) ? declaration(matchType.COMMAND) : reference(matchType.COMMAND);
  }
  return matchType.UNKNOWN;
}

function matchParameter(word, line, index) {
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
  const identifier = (line.substring(0, openingIndex).match(/\(?[a-zA-Z_]+$/) || [])[0].replace(/^\(/, '');
  const paramIndex = (line.substring(openingIndex).match(/,/g) || []).length;
  if (identifier === '') {
    return matchType.UNKNOWN;
  } else if (identifier === 'queue') {
    // queue (todo - get queue signature)
    // name of queue is first param (update identifier to this)
    // first param could also be a local variable (return UNKNOWN since identifier name is unknown)
    // 3rd param onwards are custom (2nd param is an int, can ignore it)
    return matchType.UNKNOWN;
  } else if (identifier.startsWith('~')) {
    identifier = identifier.substring(1);
    // proc (todo - get proc signature) 
    return matchType.UNKNOWN;
  } else if (identifier.startsWith('@')) {
    identifier = identifier.substring(1);
    // label (todo - get label signature)
    return matchType.UNKNOWN;
  } else {
    const command = commands[identifier];
    if (!command) {
      return matchType.UNKNOWN;
    }
    const param = command.params[paramIndex];
    return !param ? matchType.UNKNOWN : param.matchType;
  }
}

function reference(type) {
  return { ...type, declaration: false };
}

function declaration(type) {
  return { ...type, declaration: true };
}

module.exports = { matchWord };