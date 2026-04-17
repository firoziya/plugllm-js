'use strict';

import { BaseLLM, ChatResponse } from '../base.js';

class ChatOllama extends BaseLLM {
  constructor({ model = 'gemma3', apiKey = null, baseUrl = 'http://localhost:11434', timeout = 60, maxHistory = 10, ...config } = {}) {
    super(model, apiKey, maxHistory, config);
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  _allowNoApiKey() { return true; }
  _getEnvVarName() { return 'OLLAMA_API_KEY'; }

  _buildPayload(prompt, stream = false, kwargs = {}) {
    const messages = this._formatMessages(prompt);

    if (messages.length === 1 && messages[0].role === 'user') {
      return {
        endpoint: `${this.baseUrl}/api/generate`,
        payload: { model: this.model, prompt: messages[0].content, stream, ...this.config, ...kwargs },
        useChat: false,
      };
    }

    return {
      endpoint: `${this.baseUrl}/api/chat`,
      payload: { model: this.model, messages, stream, ...this.config, ...kwargs },
      useChat: true,
    };
  }

  async generate(prompt, kwargs = {}) {
    const { endpoint, payload, useChat } = this._buildPayload(prompt, false, kwargs);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.timeout * 1000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    const data = await response.json();

    const content = useChat
      ? data.message?.content || ''
      : data.response || '';

    return new ChatResponse({ content, model: this.model, rawResponse: data });
  }

  async *stream(prompt, kwargs = {}) {
    const { endpoint, payload, useChat } = this._buildPayload(prompt, true, kwargs);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.timeout * 1000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            const content = useChat
              ? data.message?.content
              : data.response;
            if (content) yield content;
            if (data.done) return;
          } catch {}
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

export { ChatOllama };
