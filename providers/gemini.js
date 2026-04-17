'use strict';

import { BaseLLM, ChatResponse } from '../base.js';

class ChatGemini extends BaseLLM {
  constructor({ model = 'gemini-2.0-flash', apiKey = null, timeout = 60, maxHistory = 10, ...config } = {}) {
    super(model, apiKey, maxHistory, config);
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.timeout = timeout;
  }

  _getEnvVarName() { return 'GEMINI_API_KEY'; }

  _formatGeminiPayload(messages) {
    const contents = [];
    let systemInstruction = null;

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemInstruction = { parts: [{ text: msg.content }] };
      } else {
        const geminiRole = msg.role === 'user' ? 'user' : 'model';
        contents.push({ role: geminiRole, parts: [{ text: msg.content }] });
      }
    }

    const payload = { contents };
    if (systemInstruction) payload.systemInstruction = systemInstruction;
    return payload;
  }

  async generate(prompt, kwargs = {}) {
    const messages = this._formatMessages(prompt);
    const payload = { ...this._formatGeminiPayload(messages), ...kwargs };

    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.timeout * 1000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    const data = await response.json();

    return new ChatResponse({
      content: data.candidates[0].content.parts[0].text,
      model: this.model,
      rawResponse: data,
      finishReason: data.candidates[0].finishReason,
    });
  }

  async *stream(prompt, kwargs = {}) {
    const messages = this._formatMessages(prompt);
    const payload = { ...this._formatGeminiPayload(messages), ...kwargs };

    const url = `${this.baseUrl}/models/${this.model}:streamGenerateContent?alt=sse&key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.timeout * 1000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);

    for await (const raw of this._parseSSEStream(response)) {
      try {
        const data = JSON.parse(raw);
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (content) yield content;
      } catch {}
    }
  }
}

export { ChatGemini };
