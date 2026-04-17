'use strict';

import { BaseLLM, ChatResponse } from '../base.js';

class ChatCohere extends BaseLLM {
  constructor({ model = 'command-a-03-2025', apiKey = null, timeout = 60, maxHistory = 10, ...config } = {}) {
    super(model, apiKey, maxHistory, config);
    this.baseUrl = 'https://api.cohere.com/v2';
    this.timeout = timeout;
  }

  _getEnvVarName() { return 'CO_API_KEY'; }

  _getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
  }

  async generate(prompt, kwargs = {}) {
    const messages = this._formatMessages(prompt);
    const payload = { model: this.model, messages, ...this.config, ...kwargs };

    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.timeout * 1000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    const data = await response.json();

    return new ChatResponse({
      content: data.message.content[0].text,
      model: this.model,
      usage: data.usage,
      rawResponse: data,
      finishReason: data.finish_reason,
    });
  }

  async *stream(prompt, kwargs = {}) {
    const messages = this._formatMessages(prompt);
    const payload = { model: this.model, messages, stream: true, ...this.config, ...kwargs };

    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.timeout * 1000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);

    for await (const raw of this._parseSSEStream(response)) {
      try {
        const data = JSON.parse(raw);
        if (data.type === 'text-generation') yield data.text;
      } catch {}
    }
  }
}

export { ChatCohere };
