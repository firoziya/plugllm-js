'use strict';

import { CONFIG } from '../config.js';
import { ProviderBase } from './base.js';

class MistralProvider extends ProviderBase {
  async send(messages) {
    const url = CONFIG.baseUrl || 'https://api.mistral.ai/v1/chat/completions';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: CONFIG.model, messages }),
    });
    const data = await response.json();
    return data.choices[0].message.content;
  }
}

export { MistralProvider };
