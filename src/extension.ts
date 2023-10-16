import * as vscode from 'vscode';
import { GPTCoderWebviewProvider } from './GPTCoderWebviewProvider';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('gptcoder.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from GPTCoder!');
	});

	context.subscriptions.push(disposable);

	// Create an output channel
	const outputChannel = vscode.window.createOutputChannel('GPTCoder');
	context.subscriptions.push(outputChannel);

	// Greet user and show ouput channel
	outputChannel.appendLine('Welcome to GPTCoder!');
	outputChannel.show();

	const gptcoderWebviewProvider = new GPTCoderWebviewProvider(context.extensionUri, context, outputChannel);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(GPTCoderWebviewProvider.viewType, gptcoderWebviewProvider),
	);
}

export function deactivate() {}
