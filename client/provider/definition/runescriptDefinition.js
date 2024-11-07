const vscode = require('vscode');
const fs = require('fs');
const matchUtils = require('../../utils/matchUtils');
const matchType = require('../../enum/MatchType');

const runescriptDefinitionProvider = {
    async provideDefinition(document, position, token) {
        const { word, match } = matchUtils.matchWord(document, position);
        if (!word) {
            return null;
        }

        switch (match.id) {
            case matchType.LOCAL_VAR.id: return gotoLocalVar(document, word);
            default: return await gotoDefinition(match, word);
        }
    }
}

const gotoLocalVar = (document, word) => {
    // TODO: limit search to the block, not the entire document (if local var is defined in multiple blocks it can go to wrong def)
    const varKeyword = "(int|string|boolean|seq|locshape|component|idk|midi|npc_mode|namedobj|synth|stat|npc_stat|fontmetrics|enum|loc|model|npc|obj|player_uid|spotanim|npc_uid|inv|category|struct|dbrow|interface|dbtable|coord|mesanim|param|queue|weakqueue|timer|softtimer|char|dbcolumn|proc|label)\\b";
    const match = document.getText().match(new RegExp(`${varKeyword} \\$${word}`));
    const matchPosition = document.positionAt(match.index);
    return !match ? null : new vscode.Location(document.uri, matchPosition.translate(0, match[1].length + 1));
}

const gotoDefinition = async (match, word) => {
	// Might want to switch to findTextInFiles when released https://github.com/microsoft/vscode/issues/59921#issuecomment-2231630101
	if (!match || !match.definitionFiles || !match.definitionFormat) {
		return null;
	}
	let inclusions = [];
	match.definitionFiles.forEach(fileType => inclusions.push(`**/*.${fileType}`));
	const exclude = "{**​/node_modules/**,**/ref/**,**/public/**,**/pack/**,**/3rdparty/**,**/jagex2/**,**/lostcity/**}";
	const files = await vscode.workspace.findFiles('{' + inclusions.join(",") + '}', exclude);

    let matchingFileUri;
    let matchingFilePosition;
    const definitionText = match.definitionFormat.replace("NAME", word);
    files.some(fileUri => {
        const fileText = fs.readFileSync(fileUri.path, "utf8");
        const index = fileText.indexOf(definitionText);
        if (index >= 0) {
            matchingFileUri = fileUri;
            const split = fileText.slice(0, index).split(/\r\n|\r|\n/g);
            const lineNum = split ? split.length - 1 : 0;
            const lineIndex = split[lineNum].length + definitionText.indexOf(word);
            matchingFilePosition = new vscode.Position(lineNum, lineIndex);
        }
    })
    return !matchingFileUri ? null : new vscode.Location(matchingFileUri, matchingFilePosition);
}

module.exports = runescriptDefinitionProvider;
