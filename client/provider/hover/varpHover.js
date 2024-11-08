const vscode = require('vscode');
const path = require('path');

const varpHoverProvider = function(context) {
  return {
    provideHover(document, position, token) {
      const range = document.getWordRangeAtPosition(position);
      const key = document.getText(range);

      const content = new vscode.MarkdownString();
      content.supportHtml = true;
      content.isTrusted = true;
      content.supportThemeIcons = true;
      content.baseUri = vscode.Uri.file(path.join(context.extensionPath, 'icons', path.sep)); 

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
  };
}

module.exports = varpHoverProvider;
