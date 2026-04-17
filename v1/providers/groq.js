'use strict';

import { CONFIG } from '../config.js';
import { ProviderBase } from './base.js';

function validateConfig() {
  if (!CONFIG.apiKey) throw new Error('GROQ_API_KEY is not set in configuration');
  if (!CONFIG.model)  throw new Error('Model is not specified in configuration');
  if (!CONFIG.baseUrl) CONFIG.baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
}

class GroqProvider extends ProviderBase {
  constructor() {
    super();
    validateConfig();
  }

  async send(messages) {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('Messages must be a non-empty array');
    }
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        throw new Error("Each message must have 'role' and 'content' keys");
      }
    }

    const response = await fetch(CONFIG.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: CONFIG.model,
        messages,
        temperature: CONFIG.temperature || 0.7,
      }),
    });

    const res = await response.json();

    if (res.error) throw new Error(`Groq API Error: ${res.error.message || 'Unknown error'}`);
    if (!response.ok) throw new Error(`API request failed with status ${response.status}`);

    return res.choices[0].message.content;
  }
}

export { GroqProvider };
