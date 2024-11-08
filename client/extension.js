const vscode = require('vscode');
const varpHoverProvider = require('./provider/hover/varpHover');
const hoverProvider = require('./provider/hover/hoverProvider');
const recolProvider = require('./provider/color/recolorProvider');
const runescriptDefinitionProvider = require('./provider/definition/runescriptDefinition');
const { gotoDefinitionProvider } = require('./provider/definition/gotoDefinition');

function activate(context) {
    vscode.languages.registerHoverProvider('runescript', hoverProvider(context));
    vscode.languages.registerHoverProvider('locconfig', hoverProvider(context));
    vscode.languages.registerHoverProvider('objconfig', hoverProvider(context));
    vscode.languages.registerHoverProvider('npcconfig', hoverProvider(context));
    vscode.languages.registerHoverProvider('dbtableconfig', hoverProvider(context));
    vscode.languages.registerHoverProvider('dbrowconfig', hoverProvider(context));
    vscode.languages.registerHoverProvider('paramconfig', hoverProvider(context));
    vscode.languages.registerHoverProvider('structconfig', hoverProvider(context));
    vscode.languages.registerHoverProvider('enumconfig', hoverProvider(context));
    vscode.languages.registerHoverProvider('varpconfig', hoverProvider(context));
    vscode.languages.registerHoverProvider('varnconfig', hoverProvider(context));
    vscode.languages.registerHoverProvider('varsconfig', hoverProvider(context));
    vscode.languages.registerHoverProvider('invconfig', hoverProvider(context));
    vscode.languages.registerHoverProvider('seqconfig', hoverProvider(context));
    vscode.languages.registerHoverProvider('spotanimconfig', hoverProvider(context));
    vscode.languages.registerHoverProvider('mesanimconfig', hoverProvider(context));
    vscode.languages.registerHoverProvider('idkconfig', hoverProvider(context));
    vscode.languages.registerHoverProvider('huntconfig', hoverProvider(context));
    vscode.languages.registerHoverProvider('constants', hoverProvider(context));
    vscode.languages.registerHoverProvider('interface', hoverProvider(context));

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
