const vscode = require('vscode');
const matchType = require("../enum/MatchType");

const matchWord = (document, position) => {
	const wordRange = document.getWordRangeAtPosition(position);
	if (!wordRange) {
		return returnDefault();
	}

	const word = document.getText(wordRange);
	const lineText = document.lineAt(position.line).text;
	if (lineText.startsWith('//') || isPositionInString(lineText, position) || word.match(/^\d+.?\d+$/)) {
		return returnDefault(); // Ignore comments and strings and numbers
	}
	
	const prevWord = getPrevWord(document, wordRange.start);
	const fileType = document.uri.path.split(/[#?]/)[0].split('.').pop().trim();
	const identifier = wordRange.start.character > 0 ? lineText.charAt(wordRange.start.character - 1) : '';

	let match = matchType.UNKNOWN;
	switch (identifier) {
		case '[': match = getOpenBracketMatchType(fileType); break;
		case ',': match = getCommaMatchType(prevWord); break;
		case '^': match = getConstantMatchType(fileType); break;
		case '%': match = matchType.GLOBAL_VAR; break;
		case '@': match = matchType.LABEL; break;
		case '~': match = matchType.PROC; break;
		case '$': match = getLocalVarMatchType(prevWord); break;
		case '(': match = getOpenParenthesisMatchType(prevWord); break;
	}

	if (match === matchType.UNKNOWN) {
		console.log("UNKNOWN");
		return returnDefault();
	}

	return {
		"word": word,
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
	return {
		"word": null,
		"match": matchType.UNKNOWN
	}
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
		return matchType.LOCAL_VAR;
	}
	if (prevWord.startsWith("def_")) {
		prevWord = prevWord.substr(4);
	}
	const defKeyword = "\\b(int|string|boolean|seq|locshape|component|idk|midi|npc_mode|namedobj|synth|stat|npc_stat|fontmetrics|enum|loc|model|npc|obj|player_uid|spotanim|npc_uid|inv|category|struct|dbrow|interface|dbtable|coord|mesanim|param|queue|weakqueue|timer|softtimer|char|dbcolumn|proc|label)\\b";
	const match = prevWord.match(new RegExp(defKeyword));
	return !match ? matchType.LOCAL_VAR : matchType.LOCAL_VAR_DECLARATION;
}

function getOpenBracketMatchType(fileType) {
	switch (fileType) {
		case "varp": case "varn": case "vars": return matchType.GLOBAL_VAR_DECLARATION;
		case "obj": return matchType.OBJ_DECLARATION;
		case "loc": return matchType.LOC_DECLARATION;
		case "npc": return matchType.NPC_DECLARATION;
		case "param": return matchType.PARAM_DECLARATION;
		case "seq": return matchType.SEQ_DECLARATION;
		case "struct": return matchType.STRUCT_DECLARATION;
		case "dbrow": return matchType.DBROW_DECLARATION;
		case "dbtable": return matchType.DBTABLE_DECLARATION;
		case "enum": return matchType.ENUM_DECLARATION;
	}
	return matchType.UNKNOWN;
}

function getCommaMatchType(prevWord) {
	switch (prevWord) {
		case "proc": return matchType.PROC_DECLARATION;
		case "label": return matchType.LABEL_DECLARATION;
		case "queue": return matchType.QUEUE_DECLARATION;
		case "timer": return matchType.TIMER_DECLARATION;
		case "softtimer": return matchType.SOFTTIMER_DECLARATION;
	}
	return matchType.UNKNOWN;
}

function getOpenParenthesisMatchType(prevWord) {
	switch (prevWord) {
		case "queue": return matchType.QUEUE;
		case "settimer": case "cleartimer": return matchType.TIMER;
		case "softtimer": case "clearsofttimer": return matchType.SOFTTIMER;
	}
	return matchType.UNKNOWN;
}

function getConstantMatchType(fileType) {
	if (fileType === "constant") {
		return matchType.CONSTANT_DECLARATION;
	}
	return matchType.CONSTANT;
}

module.exports = { matchWord };