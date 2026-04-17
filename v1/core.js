'use strict';

import { CONFIG } from './config.js';
import { formatPrompt } from './prompts.js';
import { getProvider } from './providers/index.js';

async function generate(prompt) {
  const provider = getProvider(CONFIG.provider);
  const formatted = formatPrompt(prompt);
  return provider.send(formatted);
}

export { generate };
