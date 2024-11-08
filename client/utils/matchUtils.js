const matchType = require("../enum/MatchType");

const matchWord = (document, position) => {
  const wordRange = document.getWordRangeAtPosition(position);
  if (!wordRange) {
    return returnDefault();
  }

  const word = document.getText(wordRange);
  const lineText = document.lineAt(position.line).text;
  if (lineText.startsWith('//') || word.match(/^\d+.?\d+$/)) {
    return returnDefault(); // Ignore comments and numbers
  }

  const prevWord = getPrevWord(document, wordRange.start);
  const fileType = document.uri.path.split(/[#?]/)[0].split('.').pop().trim();
  const identifier = wordRange.start.character > 0 ? lineText.charAt(wordRange.start.character - 1) : '';

  let match = matchType.UNKNOWN;
    switch (identifier) {
    case '[': match = getOpenBracketMatchType(fileType); break;
    case ',': match = getCommaMatchType(prevWord); break;
    case '^': match = getConstantMatchType(fileType); break;
    case '%': match = reference(matchType.GLOBAL_VAR); break;
    case '@': match = reference(matchType.LABEL); break;
    case '~': match = reference(matchType.PROC); break;
    case '$': match = getLocalVarMatchType(prevWord); break;
    case '(': match = getOpenParenthesisMatchType(prevWord); break;
    case '=': match = getEqualsMatchType(prevWord); break;
  }

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

function isPositionInString(lineText, position) {
  const lineTillCurrentPosition = lineText.substr(0, position.character);

  // Count the number of double quotes in the line till current position. Ignore escaped double quotes
  let doubleQuotesCnt = (lineTillCurrentPosition.match(/\"/g) || []).length;
  const escapedDoubleQuotesCnt = (lineTillCurrentPosition.match(/\\\"/g) || []).length;

  doubleQuotesCnt -= escapedDoubleQuotesCnt;
  return doubleQuotesCnt % 2 === 1;
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
    case "opplayeru": case "applayeru": return reference(matchType.OBJ);
    case "opnpct": case "opplayert": case "apnpct": case "applayert": return reference(matchType.INTERFACE);
  }
  switch (prevWord.substring(0, Math.min(5, prevWord.length))) {
    case "oploc": case "aploc": return reference(matchType.LOC);
    case "ophel": case "opobj": return reference(matchType.OBJ);
    case "opnpc": case "ai_qu": case "ai_ap": case "ai_ti": return reference(matchType.NPC);
  }
  return matchType.UNKNOWN;
}

function getOpenParenthesisMatchType(prevWord) {
	switch (prevWord) {
		case "queue": case "getqueue": case "clearqueue": case "weakqueue": case "strongqueue":
			return reference(matchType.QUEUE);
		case "settimer": case "cleartimer": case "gettimer":
			return reference(matchType.TIMER);
		case "softtimer": case "clearsofttimer": 
			return reference(matchType.SOFTTIMER);
		case "npc_sethuntmode": 
			return reference(matchType.HUNT);
		case "enum_getoutputcount":
			return reference(matchType.ENUM);
		case "gosub":
			return reference(matchType.PROC);
		case "jump":
			return reference(matchType.LABEL);
		case "anim": case "loc_anim": case "npc_anim": case "bas_readyanim": case "bas_running": case "bas_turnonspot": case "bas_walk_f": case "bas_walk_b": case "bas_walk_l": case "bas_walk_r": case "seqlength": 
			return reference(matchType.SEQ);
		case "spotanim_npc": case "spotanim_map": case "spotanim_pl": 
			return reference(matchType.SPOTANIM);
		case "loc_change": case "loc_type": case "lc_name": case "lc_param": case "lc_width": case "lc_length": case "lc_debugname": case "lc_desc": case "lc_debugname": 
			return reference(matchType.LOC);
		case "npc_changetype": case "nc_name": case "nc_param": case "nc_category": case "nc_desc": case "nc_debugname": case "nc_op": 
			return reference(matchType.NPC);
		case "oc_name": case "oc_param": case "oc_category": case "oc_desc": case "oc_members": case "oc_weight": case "oc_wearpos": case "oc_wearpos2": case "oc_wearpos3": case "oc_cost": case "oc_tradeable": case "oc_debugname": case "oc_cert": case "oc_uncert": case "oc_stackable":
			return reference(matchType.OBJ);
		case "db_getfieldcount": case "db_getrowtable":
			return reference(matchType.DBROW);
		case "db_find": case "db_listall": case "db_listall_with_count":
			return reference(matchType.DBTABLE);
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

function reference(type) {
  return { ...type, declaration: false };
}

function declaration(type) {
  return { ...type, declaration: true };
}

module.exports = { matchWord };