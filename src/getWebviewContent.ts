import * as vscode from 'vscode';
import * as path from 'path';

export default function getWebviewContent(webviewView: vscode.WebviewView, context: vscode.ExtensionContext) {
	const openAiKey = vscode.workspace.getConfiguration('gptcoder').get('openAiKey');
    const openAiModel = vscode.workspace.getConfiguration('gptcoder').get('openAiModel');

	const createSourceUrl = (path: string) => {
		return webviewView.webview.asWebviewUri(vscode.Uri.file(path));
	};

	const html = `<!doctype html>
<html lang="en">

<head>
	<meta charset="UTF-8" />
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; 
                            img-src ${webviewView.webview.cspSource} data:; 
                            script-src ${webviewView.webview.cspSource}; 
                            style-src ${webviewView.webview.cspSource} 'unsafe-inline' https://cdn.jsdelivr.net; 
                            font-src https://cdn.jsdelivr.net;" />
	<link rel="stylesheet" href="${createSourceUrl(path.join(context.extensionPath, 'styles', 'styles.css'))}" />
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vscode-codicons/dist/codicon.css">
</head>

<body>
	<div id="root">
		<h1 id="header">
			<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 800 800"
				style="enable-background:new 0 0 800 800;" xml:space="preserve">
				<g id="_xD83D__xDD0D_-Product-Icons">
					<g id="ic_fluent_bot_24_filled">
						<path id="_xD83C__xDFA8_-Color" class="st0"
							d="M612.5,473.9c45.9,0,83.2,37.2,83.2,83.2v33.5c0,40.4-17.6,78.8-48.3,105.2
                                c-57.9,49.7-140.7,74-247.5,74c-106.8,0-189.6-24.3-247.3-73.9c-30.6-26.3-48.2-64.7-48.2-105.1v-33.5c0-45.9,37.2-83.2,83.2-83.2
                                H612.5z M396.1,30.6l3.8-0.3c14,0,25.6,10.4,27.5,24l0.3,3.8l0,27.7l129.4,0c45.9,0,83.2,37.2,83.2,83.2v166.5
                                c0,45.9-37.2,83.2-83.2,83.2H242.8c-45.9,0-83.2-37.2-83.2-83.2V168.9c0-45.9,37.2-83.2,83.2-83.2l129.4,0l0-27.7
                                C372.2,44,382.6,32.4,396.1,30.6l3.8-0.3L396.1,30.6z M316.7,196.7c-25.5,0-46.2,20.7-46.2,46.2c0,25.5,20.7,46.2,46.2,46.2
                                c25.5,0,46.2-20.7,46.2-46.2C362.9,217.3,342.2,196.7,316.7,196.7z M482.8,196.7c-25.5,0-46.2,20.7-46.2,46.2
                                c0,25.5,20.7,46.2,46.2,46.2c25.5,0,46.2-20.7,46.2-46.2C528.9,217.3,508.3,196.7,482.8,196.7z" />
					</g>
				</g>
			</svg>
			<span>GPTCoder</span>
		</h1>
		<button id="btn-add-to-stack">
			<span class="codicon codicon-checklist"></span>
			Add selection to Stack</button>
		<ol id="stack"></ol>
		<button id="btn-clear-stack">
			<span class="codicon codicon-trash"></span>
			Clear Stack</button>
		<textarea id="prompt" placeholder="Ask GPTCoder..." style="width: 95%; height: 10rem;"></textarea>
		<button id="btn-generate">
			<span class="codicon codicon-play"></span>
			Generate</button>
		<hr />
		<button id="btn-settings">
			<span class="codicon codicon-settings"></span>
			Settings
		</button>
		<div id="settings" class="hidden">
			<div class="form-control">
				<label for="open-ai-key">OpenAI API Key</label>
				<input type="text" id="open-ai-key" name="openAiKey" placeholder="OpenAI API Key"
					value="${openAiKey}" />
			</div>
			<div class="form-control">
				<label for="open-ai-model">OpenAI Model</label>
				<select id="open-ai-model">
					<option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
					<option value="gpt-3.5-turbo-16k">gpt-3.5-turbo-16k</option>
					<option value="gpt-4">gpt-4</option>
					<option value="gpt-4-32k">gpt-4-32k</option>
				</select>
				<p>
					If you want to specify a custom model, you can do so by directly
					modifying the settings.json file.
				</p>
			</div>
			<button id="btn-save-settings" style="background-color: green;">
				<span class="codicon codicon-save"></span>
				Save
			</button>
		</div>
		<button id="btn-open-settings-json">Open Settings JSON</button>
		<div id="loading" class="hidden">
			<img src="${createSourceUrl(path.join(context.extensionPath, 'media', 'loading.svg'))}" />
		</div>
	</div>
	<input type="hidden" id="open-ai-model-value" value="${openAiModel}" />
	<script src="${createSourceUrl(path.join(context.extensionPath, 'out', 'webview.js'))}"></script>
</body>

</html>`;

	return html;
}
