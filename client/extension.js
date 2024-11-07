const vscode = require('vscode');
const varpHoverProvider = require('./provider/hover/varpHover');
const runescriptHoverProvider = require('./provider/hover/runescriptHover');
const recolProvider = require('./provider/color/recolorProvider');
const runescriptDefinitionProvider = require('./provider/definition/runescriptDefinition');

function activate(context) {
    vscode.languages.registerHoverProvider('varpconfig', varpHoverProvider(context));
    vscode.languages.registerHoverProvider('runescript', runescriptHoverProvider(context));

    vscode.languages.registerColorProvider('locconfig', recolProvider);
    vscode.languages.registerColorProvider('npcconfig', recolProvider);
    vscode.languages.registerColorProvider('objconfig', recolProvider);
    vscode.languages.registerColorProvider('spotanimconfig', recolProvider);
    vscode.languages.registerColorProvider('idkconfig', recolProvider);

    context.subscriptions.push(vscode.languages.registerDefinitionProvider('runescript', runescriptDefinitionProvider));
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};
