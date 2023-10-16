import * as vscode from 'vscode';
import getWebviewContent from './getWebviewContent';
import OpenAI from 'openai';

import { ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions';

export class GPTCoderWebviewProvider implements vscode.WebviewViewProvider {
	private _view?: vscode.WebviewView;
	private _context: vscode.ExtensionContext;
	private _outputChannel: vscode.OutputChannel;
	public static readonly viewType = 'gptcoder.main';
	private stack: string[] = [];
	public static readonly stackKey = 'gptcoder.stack';

	constructor(
		private readonly _extensionUri: vscode.Uri,
		context: vscode.ExtensionContext,
		ouputChannel: vscode.OutputChannel,
	) {
		this._context = context;
		this._outputChannel = ouputChannel;
	}

	addSelectionToStack() {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const selection = editor.selection;
			const text = editor.document.getText(selection);
			if (!text || text === '') {
				vscode.window.showErrorMessage('GPTCoder: Please select some code!');
				return;
			}
			vscode.env.clipboard.writeText(text);
			this.stack.push(text);
			// Store the stack in the workspace state
			this._context.workspaceState.update(GPTCoderWebviewProvider.stackKey, this.stack);

			return text;
		}

		throw new Error('No active editor');
	}

	output(text: string) {
		this._outputChannel.appendLine(text);
		this._outputChannel.show();
	}

	resolveWebviewView(webviewView: vscode.WebviewView) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Enable scripts in the webview
			enableScripts: true,
		};

		webviewView.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'saveSettings':
						const config = vscode.workspace.getConfiguration('gptcoder');
						if (message.data.openAiKey !== undefined) {
							config.update('openAiKey', message.data.openAiKey, vscode.ConfigurationTarget.Global);
                            config.update('openAiModel', message.data.openAiModel, vscode.ConfigurationTarget.Global);
							vscode.window.showInformationMessage('GPTCoder: Settings saved!');
						}
						webviewView.webview.postMessage({
                            command: 'hideLoading',
                        });
						break;
					case 'openSettingsJson':
						vscode.commands.executeCommand('workbench.action.openSettingsJson');
						break;
					case 'addSelectionToStack':
						const text = this.addSelectionToStack();
                        if (!text || text === '') {
                            return;
                        }
						vscode.window.showInformationMessage('GPTCoder: Added selection to stack!');
						webviewView.webview.postMessage({
							command: 'addToStack',
							data: text,
						});
						break;
					case 'clearStack':
						this.stack = [];
						// Remove the stack from the workspace state
						this._context.workspaceState.update(GPTCoderWebviewProvider.stackKey, this.stack);
						webviewView.webview.postMessage({
							command: 'clearStack',
						});
						vscode.window.showInformationMessage('GPTCoder: Stack cleared!');
						break;
					case 'getStack':
						webviewView.webview.postMessage({
							command: 'getStack',
							data: this.stack,
						});
						break;
					case 'generate':
						const openAiKey = vscode.workspace.getConfiguration('gptcoder').get('openAiKey') as
							| string
							| undefined;
						const openAiModel = vscode.workspace.getConfiguration('gptcoder').get('openAiModel') as
							| string
							| undefined;
						if (openAiKey === undefined) {
							vscode.window.showErrorMessage('GPTCoder: Your stack is empty!');
							return;
						}
						if (openAiModel === undefined) {
							vscode.window.showErrorMessage('GPTCoder: Please set your OpenAI model in the settings!');
							return;
						}

						// Get the stack from the workspace state
						const stack = this._context.workspaceState.get(GPTCoderWebviewProvider.stackKey) as
							| string[]
							| undefined;
						if (!stack || stack.length === 0) {
							vscode.window.showErrorMessage(
								'GPTCoder: Please select some code and add it to the stack!',
							);
                            webviewView.webview.postMessage({
                                command: 'hideLoading',
                            });
							return;
						}

						const openai = new OpenAI({
							apiKey: openAiKey,
						});
						const prompt = message.data;

						if (!prompt || prompt === '') {
							vscode.window.showErrorMessage('GPTCoder: Please enter a prompt!');
							return;
						}

						const messages: ChatCompletionCreateParamsBase['messages'] = [
							{
								role: 'system',
								content: `You are a coding wizard that helps me write code. 
                            You will be supplied with a prompt as well as a stack of code snippets. 
                            You will then generate code as instructed by the prompt.
                            
                            Rules:
                            1. Just write the code. Do not say anything else.
                            2. The first line should be the language of the code in a format that vscode.workspace.openTextDocument can understand. Just put the language. Don't put anything else or comment it.
                            3. Don't add any comment unless the prompt asks you to.
                            `,
							},
							{
								role: 'user',
								content: 'Prompt: ' + prompt + '\nStack: ' + this.stack.join('\n\n'),
							},
						];

						this.output('Generating code...');
						const timerStart = Date.now();

						openai.chat.completions
							.create({
								model: openAiModel,
								messages,
							})
							.then(gptResponse => {
								const timerEnd = Date.now();
								const timeTaken = timerEnd - timerStart;
								const timeTakenSeconds = timeTaken / 1000;

								const choices = gptResponse.choices;
								const message = choices[0].message;
								let text = message.content;
								if (!text) {
									vscode.window.showErrorMessage('GPTCoder: Error generating code!');
									return;
								}

								// Extract the language from the first line of the generated code
								const language = text.split('\n')[0].trim().toLowerCase();
								this.output(
									`Generated code in ${timeTakenSeconds} seconds!\n\nDetected language: ${language}`,
								);

								// Remove the first line of the generated code
								text = text.split('\n').slice(1).join('\n');

								// Remove first line if it is blank
								const firstLine = text.split('\n')[0];
								if (firstLine === '') {
									text = text.split('\n').slice(1).join('\n');
								}

								webviewView.webview.postMessage({
									command: 'generate',
									data: text,
								});
								// Open a new editor with the generated code
								vscode.workspace.openTextDocument({ language, content: text! }).then(doc => {
									vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
								});
							})
							.catch(err => {
								vscode.window.showErrorMessage('GPTCoder: Error generating code!');
							});
						break;
				}
			},
			undefined,
			this._context.subscriptions, // <-- Use `this._context.subscriptions` here
		);

		webviewView.webview.html = getWebviewContent(webviewView, this._context);
	}
}
