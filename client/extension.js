const vscode = require('vscode');
const varpHoverProvider = require('./provider/hover/varpHover');
const runescriptHoverProvider = require('./provider/hover/runescriptHover');
const recolProvider = require('./provider/color/recolorProvider');
const runescriptDefinitionProvider = require('./provider/definition/runescriptDefinition');
const { gotoDefinitionProvider } = require('./provider/definition/gotoDefinition');

function activate(context) {
    vscode.languages.registerHoverProvider('varpconfig', varpHoverProvider(context));
    vscode.languages.registerHoverProvider('runescript', runescriptHoverProvider(context));

    vscode.languages.registerColorProvider('locconfig', recolProvider);
    vscode.languages.registerColorProvider('npcconfig', recolProvider);
    vscode.languages.registerColorProvider('objconfig', recolProvider);
    vscode.languages.registerColorProvider('spotanimconfig', recolProvider);
    vscode.languages.registerColorProvider('idkconfig', recolProvider);

    context.subscriptions.push(vscode.languages.registerDefinitionProvider('runescript', runescriptDefinitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('locconfig', gotoDefinitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('objconfig', gotoDefinitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('npcconfig', gotoDefinitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('dbtableconfig', gotoDefinitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('dbrowconfig', gotoDefinitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('paramconfig', gotoDefinitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('structconfig', gotoDefinitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('enumconfig', gotoDefinitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('varpconfig', gotoDefinitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('varnconfig', gotoDefinitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('varsconfig', gotoDefinitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('invconfig', gotoDefinitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('seqconfig', gotoDefinitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('spotanimconfig', gotoDefinitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('mesanimconfig', gotoDefinitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('idkconfig', gotoDefinitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('huntconfig', gotoDefinitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('constants', gotoDefinitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('interface', gotoDefinitionProvider));

    // TODO Find References: https://code.visualstudio.com/api/references/vscode-api#ReferenceProvider
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};
