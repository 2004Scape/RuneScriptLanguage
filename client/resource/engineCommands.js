const https = require("https");
const stringUtils = require('../utils/stringUtils');
const identifierSvc = require('../service/identifierSvc');

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
      if (fileText === '') return;
      clearCommands();
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
            description = line.substring(descriptionPrefix.length).toLowerCase(); 
            break;
        }
      }
    });
  });
}

function clearCommands() {
  Object.keys(commands).forEach(key => delete commands[key]);
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
  
  const { params, returns } = identifierSvc.parseSignature(line);

  commands[command] = identifierSvc.build(command, null, params, returns, description, type, null);
}

module.exports = { commands, updateCommands };
