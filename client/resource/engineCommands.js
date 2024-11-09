const https = require("https");
const stringUtils = require('../utils/stringUtils');
const matchType = require('../enum/MatchType');

const remoteEngineFileUrl = "https://raw.githubusercontent.com/2004Scape/Server/refs/heads/main/data/src/scripts/engine.rs2";

const commands = {};
const lineType = { NOOP: 0, TYPE: 1, COMMAND: 2, DESCRIPTION: 3 };
const commandPrefix = "[command,";
const descriptionPrefix = "// ";

function updateCommands() {
  // Download and parse the engine.rs2 file from the Server repo, and build the commands reference object
  https.get(remoteEngineFileUrl).on('response', function (response) {
    var fileText = '';
    response.on('data', chunk => fileText += chunk);
    response.on('end', () => {
      let type;
      let description = '';
      const lines = stringUtils.getLines(fileText);
      for (const line of lines) {
        switch (getLineType(line)) {
          case lineType.TYPE: 
            type = parseType(line); 
            break;
          case lineType.COMMAND: 
            parseCommand(line, type, description); 
            description = '';
            break;
          case lineType.DESCRIPTION: 
            description = line.substring(descriptionPrefix.length); 
            break;
        }
      }
    });
  });
}

function getLineType(line) {
  if (/\/\/.+ops \(\d+-\d+\)/.test(line)) return lineType.TYPE;
  if (line.startsWith(commandPrefix)) return lineType.COMMAND;
  if (line.startsWith(descriptionPrefix)) return lineType.DESCRIPTION;
  return lineType.NOOP;
}

function parseType(line) {
  return `${line.substring(3, line.indexOf("ops") - 1).split(" ").map(word => word.toLowerCase()).join(" ")} command`;
}

function parseCommand(line, type, description) {
  // Parse command name
  const command = line.substring(commandPrefix.length, line.indexOf(']'));
  if (command.startsWith('.')) return; // ignore these commands since params are always the same
  
  // Parse input params
  const params = [];
  let openingIndex = line.indexOf('(');
  let closingIndex = line.indexOf(')');
  if (openingIndex >= 0 && closingIndex >= 0 && ++openingIndex !== closingIndex) {
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
  openingIndex = line.indexOf('(');
  closingIndex = line.indexOf(')');
  if (openingIndex >= 0 && closingIndex >= 0 && ++openingIndex !== closingIndex) {
    returns = line.substring(openingIndex, closingIndex);
  }

  commands[command] = {
    name: command,
    type: type,
    params: params,
    paramsText: params.map(param => `${param.type} ${param.name}`).join(', '),
    returns: returns,
    description: description
  };
}

module.exports = { commands, updateCommands };
