const vscode = require('vscode');
const fs = require('fs');
const stringUtils = require('../utils/stringUtils');
const matchType = require('../enum/MatchType');

const commands = {};
const lineType = { NOOP: 0, TYPE: 1, COMMAND: 2 };

async function updateCommands() {
  // Parse the engine.rs2 file to build the commands reference object
  const files = await vscode.workspace.findFiles(`**/engine.rs2`);
  const lines = stringUtils.getLines(fs.readFileSync(files[0].path, "utf8"));

  let type;
  for (const line of lines) {
    switch (getLineType(line)) {
      case lineType.TYPE: type = line.substring(3, line.indexOf("ops") - 1); break;
      case lineType.COMMAND: parseCommand(line, type); break;
    }
  }
}

function getLineType(line) {
  if (/\/\/.+ops \(\d+-\d+\)/.test(line)) return lineType.TYPE;
  if (line.startsWith("[command,")) return lineType.COMMAND
  return lineType.NOOP;
}

function parseCommand(line, type) {
  // Parse command name
  const command = line.substring(9, line.indexOf(']'));
  if (command.startsWith('.')) return; // ignore these commands since params are always the same
  
  // Parse input params
  const params = [];
  let openingIndex = line.indexOf('(') + 1;
  let closingIndex = line.indexOf(')');
  if (openingIndex >= 1 && closingIndex >= 0 && openingIndex !== closingIndex) {
    line.substring(openingIndex, closingIndex).split(',').forEach(param => {
      if (param.startsWith(' ')) param = param.substring(1);
      const split = param.split(' ');
      if (split.length === 2) {
        const match = Object.keys(matchType).filter(key => (matchType[key].types || []).includes(split[0]));
        params.push({type: split[0], name: split[1], matchType: match.length > 0 ? matchType[match[0]] : matchType.UNKNOWN});
      }
    });
  }

  // Parse response type
  let returns = '';
  line = line.substring(closingIndex + 1);
  openingIndex = line.indexOf('(') + 1;
  closingIndex = line.indexOf(')');
  if (openingIndex >= 1 && closingIndex >= 0 && openingIndex !== closingIndex) {
    returns = line.substring(openingIndex, closingIndex);
  }

  commands[command] = {
    name: command,
    type: type,
    params: params,
    paramsText: params.map(param => `${param.type} ${param.name}`).join(', '),
    returns: returns
  };
}

module.exports = { commands, updateCommands };
