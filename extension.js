// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "spike-playwright" is now active!');

	context.subscriptions.push(vscode.commands.registerCommand('spike-playwright.helloWorld', function () {
		vscode.window.showInformationMessage('Hello World from spike-playwright!');
	}));

	context.subscriptions.push(vscode.commands.registerCommand('spike-playwright.helloInput', async function () {
		const result = await vscode.window.showInputBox({
			placeHolder: 'For example: data',
		});
		vscode.window.showInformationMessage(`quick input: ${result}`);
	}));
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
