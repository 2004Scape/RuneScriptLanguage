const vscode = require('vscode');

function activate(context) {
    const recolProvider = {
        provideColorPresentations(color, context, token) {
            const r = Math.round(color.red * 31);
            const g = Math.round(color.green * 31);
            const b = Math.round(color.blue * 31);
            const rgb = (r << 10) | (g << 5) | b;

            return [
                {
                    label: 'Model Recolor',
                    textEdit: new vscode.TextEdit(context.range, rgb.toString())
                }
            ];q
        },

        provideDocumentColors(document, token) {
            const text = document.getText();
            const colorRegex = /(recol[1-6][sd])=(\d+)/g;
            let match;

            const matches = [];
            while (match = colorRegex.exec(text)) {
                const rgb = parseInt(match[2]);

                const r = (rgb >> 10) & 0x1f;
                const g = (rgb >> 5) & 0x1f;
                const b = rgb & 0x1f;

                matches.push({
                    color: new vscode.Color(r / 31, g / 31, b / 31, 1),
                    range: new vscode.Range(document.positionAt(match.index + match[1].length + 1), document.positionAt(match.index + match[1].length + match[2].length + 1))
                });
            }

            return matches;
        }
    };

    vscode.languages.registerColorProvider('locconfig', recolProvider);
    vscode.languages.registerColorProvider('npcconfig', recolProvider);
    vscode.languages.registerColorProvider('objconfig', recolProvider);
    vscode.languages.registerColorProvider('spotanimconfig', recolProvider);
    vscode.languages.registerColorProvider('idkconfig', recolProvider);
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};
