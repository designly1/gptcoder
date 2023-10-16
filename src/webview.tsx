const root = document.getElementById('root');

// @ts-ignore
const vscode = acquireVsCodeApi();

const showLoading = () => {
	const loading = document.getElementById('loading');
	if (loading) {
		loading.classList.remove('hidden');
	}
};

const hideLoading = () => {
	const loading = document.getElementById('loading');
	if (loading) {
		loading.classList.add('hidden');
	}
};

if (root) {
	// Get stack json
	showLoading();
	vscode.postMessage({
		command: 'getStack',
	});

	const openAiModelInput = document.getElementById('open-ai-model-value') as HTMLInputElement;
	if (openAiModelInput) {
		const model = openAiModelInput.value;
        const modelSelect = document.getElementById('open-ai-model') as HTMLSelectElement;
        if (modelSelect) {
            modelSelect.value = model;
        }
	}

	window.addEventListener('message', event => {
		const message = event.data;
		hideLoading();

		switch (message.command) {
			case 'feedback':
				alert(message.text);
				break;
			case 'addToStack':
				addItemToStack(message.data);
				break;
			case 'clearStack':
				const stackToClear = document.getElementById('stack');
				if (stackToClear) {
					stackToClear.innerHTML = '';
				}
				break;
			case 'getStack':
				const stackToPopulate = document.getElementById('stack');
				if (stackToPopulate) {
					message.data.forEach((item: string) => {
						addItemToStack(item);
					});
				}
				break;
			case 'hideLoading':
				hideLoading();
				break;
		}
	});

	const addItemToStack = (item: string) => {
		const stack = document.getElementById('stack');
		if (stack) {
			const li = document.createElement('li');
			// Truncate the message to 100 characters
			const truncatedMessage = item.length > 100 ? item.substring(0, 100) + '...' : item;
			li.innerText = truncatedMessage;
			stack.appendChild(li);
		}
	};

	const settingsButton = document.getElementById('btn-settings');
	settingsButton?.addEventListener('click', () => {
		const settings = document.getElementById('settings');
		if (settings) {
			if (settings.classList.contains('hidden')) {
				settings.classList.remove('hidden');
			} else {
				settings.classList.add('hidden');
			}
		}
	});

	const saveSettingsBtn = document.getElementById('btn-save-settings');

	if (saveSettingsBtn) {
		saveSettingsBtn.addEventListener('click', () => {
			const openAiKeyInput = document.getElementById('open-ai-key');
			if (!openAiKeyInput) {
				return;
			}
			const openAiKeyValue = (openAiKeyInput as HTMLInputElement).value;

			const openAiModelInput = document.getElementById('open-ai-model');
			if (!openAiModelInput) {
				return;
			}
			const openAiModelValue = (openAiModelInput as HTMLInputElement).value;

			// Send the configuration to the extension
			showLoading();
			vscode.postMessage({
				command: 'saveSettings',
				data: {
					openAiKey: openAiKeyValue,
					openAiModel: openAiModelValue,
				},
			});
		});
	}

	const openSettingsJsonBtn = document.getElementById('btn-open-settings-json');
	if (openSettingsJsonBtn) {
		openSettingsJsonBtn.addEventListener('click', () => {
			vscode.postMessage({
				command: 'openSettingsJson',
			});
		});
	}

	const addToStackBtn = document.getElementById('btn-add-to-stack');
	if (addToStackBtn) {
		addToStackBtn.addEventListener('click', () => {
			vscode.postMessage({
				command: 'addSelectionToStack',
			});
		});
	}

	const clearStackBtn = document.getElementById('btn-clear-stack');
	if (clearStackBtn) {
		clearStackBtn.addEventListener('click', () => {
			vscode.postMessage({
				command: 'clearStack',
			});
		});
	}

	const generateBtn = document.getElementById('btn-generate');
	if (generateBtn) {
		generateBtn.addEventListener('click', () => {
			const promptInput = document.getElementById('prompt');
			if (!promptInput) {
				return;
			}
			const promptValue = (promptInput as HTMLInputElement).value;
			showLoading();
			vscode.postMessage({
				command: 'generate',
				data: promptValue,
			});
		});
	}
}
