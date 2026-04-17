'use strict';

import { CONFIG } from '../config.js';
import { ProviderBase } from './base.js';

class GeminiProvider extends ProviderBase {
  async send(messages) {
    const url = CONFIG.baseUrl ||
      `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.model}:generateContent?key=${CONFIG.apiKey}`;
    const contents = messages.map(m => ({ parts: [{ text: m.content }] }));
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }
}

export { GeminiProvider };
