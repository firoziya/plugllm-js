'use strict';

import { BaseLLM, ChatResponse } from '../base.js';

class ChatLlama extends BaseLLM {
  constructor({ model = 'Llama-4-Maverick-17B-128E-Instruct-FP8', apiKey = null, baseUrl = 'https://api.llama.com/v1', timeout = 60, maxHistory = 10, ...config } = {}) {
    super(model, apiKey, maxHistory, config);
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  _getEnvVarName() { return 'LLAMA_API_KEY'; }

  _getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
  }

  async generate(prompt, kwargs = {}) {
    const messages = this._formatMessages(prompt);
    const payload = { model: this.model, messages, ...this.config, ...kwargs };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.timeout * 1000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    const data = await response.json();

    return new ChatResponse({
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage,
      rawResponse: data,
      finishReason: data.choices[0].finish_reason,
    });
  }

  async *stream(prompt, kwargs = {}) {
    const messages = this._formatMessages(prompt);
    const payload = { model: this.model, messages, stream: true, ...this.config, ...kwargs };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.timeout * 1000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);

    for await (const raw of this._parseSSEStream(response)) {
      try {
        const data = JSON.parse(raw);
        const content = data.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {}
    }
  }
}

export { ChatLlama };
