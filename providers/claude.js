'use strict';

import { BaseLLM, ChatResponse } from '../base.js';

class ChatClaude extends BaseLLM {
  constructor({ model = 'claude-sonnet-4-5', apiKey = null, timeout = 60, maxHistory = 10, ...config } = {}) {
    super(model, apiKey, maxHistory, config);
    this.baseUrl = 'https://api.anthropic.com/v1';
    this.timeout = timeout;
  }

  _getEnvVarName() { return 'ANTHROPIC_API_KEY'; }

  _getHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01',
    };
  }

  _formatClaudeMessages(messages) {
    const formatted = [];
    let systemMessage = null;

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemMessage = msg.content;
      } else {
        formatted.push(msg);
      }
    }

    return { formatted, systemMessage };
  }

  async generate(prompt, kwargs = {}) {
    const messages = this._formatMessages(prompt);
    const { formatted, systemMessage } = this._formatClaudeMessages(messages);

    const maxTokens = kwargs.max_tokens || 1024;
    const rest = { ...kwargs };
    delete rest.max_tokens;

    const payload = { model: this.model, messages: formatted, max_tokens: maxTokens, ...this.config, ...rest };
    if (systemMessage) payload.system = systemMessage;

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.timeout * 1000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    const data = await response.json();

    return new ChatResponse({
      content: data.content[0].text,
      model: data.model,
      usage: data.usage,
      rawResponse: data,
      finishReason: data.stop_reason,
    });
  }

  async *stream(prompt, kwargs = {}) {
    const messages = this._formatMessages(prompt);
    const { formatted, systemMessage } = this._formatClaudeMessages(messages);

    const maxTokens = kwargs.max_tokens || 1024;
    const rest = { ...kwargs };
    delete rest.max_tokens;

    const payload = { model: this.model, messages: formatted, max_tokens: maxTokens, stream: true, ...this.config, ...rest };
    if (systemMessage) payload.system = systemMessage;

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.timeout * 1000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);

    for await (const raw of this._parseSSEStream(response)) {
      try {
        const data = JSON.parse(raw);
        if (data.type === 'content_block_delta') {
          yield data.delta.text;
        }
      } catch {}
    }
  }
}

export { ChatClaude };
