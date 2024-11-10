const vscode = require('vscode');
const engineCommands = require('./resource/engineCommands');
const hoverProvider = require('./provider/hover/hoverProvider');
const recolorProvider = require('./provider/color/recolorProvider');
const definitionProvider = require('./provider/definition/gotoDefinition');

// Refresh engine commands once every 24 horus
const updateEngineCommands = () => {
    engineCommands.updateCommands();
    setTimeout(updateEngineCommands, 86_400_000);
}

function activate(context) {
    updateEngineCommands();

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

    vscode.languages.registerColorProvider('locconfig', recolorProvider);
    vscode.languages.registerColorProvider('npcconfig', recolorProvider);
    vscode.languages.registerColorProvider('objconfig', recolorProvider);
    vscode.languages.registerColorProvider('spotanimconfig', recolorProvider);
    vscode.languages.registerColorProvider('idkconfig', recolorProvider);

    context.subscriptions.push(vscode.languages.registerDefinitionProvider('runescript', definitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('locconfig', definitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('objconfig', definitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('npcconfig', definitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('dbtableconfig', definitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('dbrowconfig', definitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('paramconfig', definitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('structconfig', definitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('enumconfig', definitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('varpconfig', definitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('varnconfig', definitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('varsconfig', definitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('invconfig', definitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('seqconfig', definitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('spotanimconfig', definitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('mesanimconfig', definitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('idkconfig', definitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('huntconfig', definitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('constants', definitionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider('interface', definitionProvider));
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};
