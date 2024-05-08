const vscode = require('vscode');
const path = require('path');

function activate(context) {
    vscode.languages.registerHoverProvider('varpconfig', {
        provideHover(document, position, token) {
            const range = document.getWordRangeAtPosition(position);
            const key = document.getText(range);

            const content = new vscode.MarkdownString();
            content.supportHtml = true;
            content.isTrusted = true;
            content.supportThemeIcons = true;
            content.baseUri = vscode.Uri.file(path.join(context.extensionPath, 'images', path.sep)); 

            if (key === 'type') {
                content.appendMarkdown('### Type - the data type of a player variable\n');
                content.appendMarkdown('By default a player variable will store an int.');
            } else if (key === 'scope') {
                content.appendMarkdown('### Scope - the lifetime of a player variable\n');
                content.appendMarkdown('By default a player variable is temporary and will be reset on logout/login. You can make a variable persist on the player save by setting this to scope=perm (permanent).');
            } else if (key === 'protect') {
                content.appendMarkdown('### Protect - if a player variable should require protected access\n');
                content.appendMarkdown('By default a player variable *does* require protected access. To be unprotected means a script can write to it without sole access. A variable can always be read regardless of the protection requirement.\n\n');
                // content.appendMarkdown('[Read more about protection here.](https://github.com/2004scape/Server/wiki/Protection "2004scape Wiki")\n\n');
                content.appendMarkdown(`
|Property Value Type|Default Value|Acceptable Values|
|:-:|:-:|:-:|
|boolean|yes|yes/true/1, no/false/0|
`);
            } else if (key === 'clientcode') {
                content.appendMarkdown('### Client Code - this ties the variable to specific client-side code logic\n');
                content.appendMarkdown('The acceptable values are available in the client source... if you actually need to use this you\'ll know what to put.\n\n');
            } else if (key === 'transmit') {
                content.appendMarkdown('### Transmit - when and if a player variable should be transmitted to the client\n');
                content.appendMarkdown('By default a player variable is not transmitted to the client. You can send a variable to the client by setting this to transmit=yes. The main use for this property is in conjunction with interfaces.\n\n');
            }

            if (content.value.length) {
                return new vscode.Hover(content);
            }
        }
    });

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
