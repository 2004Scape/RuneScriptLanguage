const fs = require('fs');
const https = require("https");
const vscode = require('vscode');
const stringUtils = require('../utils/stringUtils');
const identifierFactory = require('./identifierFactory');
const matchType = require('../matching/matchType');

const remoteEngineFileUrl = "https://raw.githubusercontent.com/2004Scape/Server/refs/heads/main/data/src/scripts/engine.rs2";

const commands = {};
const lineType = { NOOP: 0, TYPE: 1, COMMAND: 2, DESCRIPTION: 3 };
const commandPrefix = "[command,";
const descriptionPrefix = "// ";

function updateCommands() {
  // Download and parse the engine.rs2 file from the Server repo, and build the commands reference object
  // Fall back to local engine.rs2 file is https request fails (allow offline usage)
  https.get(remoteEngineFileUrl, response => {
      var fileText = '';
      if (response.statusCode !== 200) throw new Error('non 200');
      response.on('data', chunk => fileText += chunk);
      response.on('end', () => {
        (fileText) ? populateCommands(fileText) : loadLocalCommandsFile('empt');
      });
    })
    .on('error', e => loadLocalCommandsFile(e));
}

function loadLocalCommandsFile(from) {
  const inclusions = `**/engine.rs2`;
  vscode.workspace.findFiles(inclusions).then(res => {
    if (res.length > 0) {
      populateCommands(fs.readFileSync(res[0].path, "utf8"));
    }
  });
}

function populateCommands(fileText) {
  if (!fileText) return;
  clearCommands();
  let type;
  let description = '';
  let lineNum = 0;
  const lines = stringUtils.getLines(fileText);
  for (const line of lines) {
    switch (getLineType(line)) {
      case lineType.TYPE: 
        type = parseType(line); 
        break;
      case lineType.COMMAND:
        let commandLine = line.startsWith('// ') ? line.substring(3) : line;
        parseCommand(commandLine, type, description, lineNum); 
        description = '';
        break;
      case lineType.DESCRIPTION: 
        description = line.substring(descriptionPrefix.length).toLowerCase(); 
        break;
    }
    lineNum++;
  }

  // Add extra commands not defined in engine.rs2
  commands.calc = identifierFactory.build('calc (number command)', matchType.COMMAND, null, 'Used to calculate basic arithmetic expressions', '[command,calc](expression $expression)(int)');
}

function clearCommands() {
  Object.keys(commands).forEach(key => delete commands[key]);
}

function getLineType(line) {
  if (/\/\/.+ops \(\d+-\d+\)/.test(line)) return lineType.TYPE;
  //if (/\/\/ \[command/.test(line)) return lineType.COMMAND; // Also parses commented commands (disbaled)
  if (line.startsWith(commandPrefix)) return lineType.COMMAND;
  if (line.startsWith(descriptionPrefix)) return lineType.DESCRIPTION;
  return lineType.NOOP;
}

function parseType(line) {
  return `${line.substring(3, line.indexOf("ops") - 1).split(" ").map(word => word.toLowerCase()).join(" ")} command`;
}

function parseCommand(line, type, description, lineNum) {
  const command = line.substring(commandPrefix.length, line.indexOf(']'));
  if (command.startsWith('.') && !description) {
    description = commands[command.substring(1)].info;
  }
  commands[command] = { ...identifierFactory.build(`${command} (${type})`, matchType.COMMAND, null, description, line), line: lineNum };
}

function addLocation(uri) {
  const index = commandPrefix.length;
  Object.keys(commands).forEach(key => {
    if (commands[key].line) {
      commands[key].location = new vscode.Location(uri, new vscode.Position(commands[key].line, index));
    }
  });
}

module.exports = { commands, updateCommands, addLocation };
