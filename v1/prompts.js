'use strict';

function formatPrompt(prompt) {
  if (typeof prompt === 'string') {
    return [{ role: 'user', content: prompt }];
  } else if (Array.isArray(prompt)) {
    return prompt;
  } else {
    throw new Error('Prompt must be a string or array of messages');
  }
}

export { formatPrompt };
