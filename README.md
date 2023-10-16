# GPTCoder Documentation

## Overview

GPTCoder is a Visual Studio Code extension that uses OpenAI's GPT to assist in writing code. 

## Setup

1. Download the extension from the 'Extensions' tab inside VS Code or from the VS Code extensions marketplace. 
2. Once downloaded, click on the GPTCoder icon on the activity bar to open the GPTCoder panel.
3. You will need to specify your OpenAI API key and the OpenAI Model to use. This can be set in the settings section in the GPTCoder panel or in the settings.json file of Visual Studio Code (accessed via 'Open Settings JSON' button).

## Usage

1. Highlight the code you wish to work with and click on the 'Add selection to Stack' button. This will add the selected code to the stack in the GPTCoder panel.
2. Provide a prompt in the 'Ask GPTCoder...' input field, describing the task you want the AI to accomplish using the code snippets in the stack.
3. Click on the 'Generate' button.
4. The generated code will appear in a new text document.

## Features

- 'Add selection to Stack': This feature captures your selected code and stores it in the current session.
- 'Clear Stack': This button clears the current stack.
- 'Generate': This button prompts GPT-3 to generate a solution (given the current stack and a prompt).
- 'Settings': Allows the user to save OpenAI API key and model.

## Notes
- Important: Obtain an OpenAI API key from [OpenAI's website](https://openai.com/). Check their documentation for more details.
- Warning: Avoid sharing your OpenAI API key. It may result in unauthorized access which you will be billed for.
- The OpenAI Model is set to 'gpt-3.5-turbo' by default. If you have access to a different model on the OpenAI platform, you can specify by using settings.json or in the settings of the extension.

Remember, you are responsible for securing your OpenAI API key and following OpenAI's use case policies.