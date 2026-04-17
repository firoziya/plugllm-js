'use strict';

/**
 * PlugLLM Base Classes
 * Mirrors plugllm/base.py
 */

// ============================================
// DEQUE IMPLEMENTATION
// ============================================

class Deque {
  constructor(maxlen = Infinity) {
    this.maxlen = maxlen;
    this._items = [];
  }
  append(item) {
    this._items.push(item);
    if (this._items.length > this.maxlen) this._items.shift();
  }
  popleft() { return this._items.shift(); }
  clear() { this._items = []; }
  get length() { return this._items.length; }
  toArray() { return [...this._items]; }
  [Symbol.iterator]() { return this._items[Symbol.iterator](); }
}

// ============================================
// MESSAGE
// ============================================

class Message {
  constructor(role, content) {
    this.role = role;
    this.content = content;
  }

  toDict() {
    return { role: this.role, content: this.content };
  }

  static user(content) { return new Message('user', content); }
  static assistant(content) { return new Message('assistant', content); }
  static system(content) { return new Message('system', content); }
}

// ============================================
// CHAT RESPONSE
// ============================================

class ChatResponse {
  constructor({ content, model, usage = null, rawResponse = null, finishReason = null }) {
    this.content = content;
    this.model = model;
    this.usage = usage;
    this.rawResponse = rawResponse;
    this.finishReason = finishReason;
  }

  toString() { return this.content; }

  toDict() {
    return {
      content: this.content,
      model: this.model,
      usage: this.usage,
      finishReason: this.finishReason,
    };
  }
}

// ============================================
// CONVERSATION CONTEXT
// ============================================

class ConversationContext {
  constructor(maxHistory = 10) {
    this.messages = new Deque(maxHistory);
    this.systemMessage = null;
    this.maxHistory = maxHistory;
  }

  addMessage(message) {
    this.messages.append(message);
  }

  addUserMessage(content) {
    this.addMessage(Message.user(content));
  }

  addAssistantMessage(content) {
    this.addMessage(Message.assistant(content));
  }

  getConversation() {
    const conv = [];
    if (this.systemMessage) conv.push(this.systemMessage);
    conv.push(...this.messages.toArray());
    return conv;
  }

  clear() { this.messages.clear(); }

  reset() {
    this.messages.clear();
    this.systemMessage = null;
  }

  setSystemMessage(content) {
    this.systemMessage = Message.system(content);
  }

  getHistoryLength() { return this.messages.length; }

  toDict() {
    return {
      messages: this.messages.toArray().map(m => m.toDict()),
      systemMessage: this.systemMessage ? this.systemMessage.toDict() : null,
      maxHistory: this.maxHistory,
    };
  }
}

// ============================================
// BASE LLM
// ============================================

class BaseLLM {
  constructor(model, apiKey = null, maxHistory = 10, config = {}) {
    if (new.target === BaseLLM) throw new Error('BaseLLM is abstract');
    this.model = model;
    this.apiKey = apiKey || process.env[this._getEnvVarName()];
    this.config = config;
    this.maxHistory = maxHistory;
    this._contexts = {};
    this._validateConfig();
  }

  _getEnvVarName() {
    return `${this.constructor.name.toUpperCase()}_API_KEY`;
  }

  _validateConfig() {
    if (!this.model) throw new Error('Model name is required');
    if (!this.apiKey && !this._allowNoApiKey()) {
      throw new Error(`API key is required for ${this.constructor.name}`);
    }
  }

  _allowNoApiKey() { return false; }

  // Abstract - must be implemented
  async generate(prompt, kwargs = {}) {
    throw new Error(`${this.constructor.name}.generate() not implemented`);
  }

  async *stream(prompt, kwargs = {}) {
    throw new Error(`${this.constructor.name}.stream() not implemented`);
  }

  // ============================================
  // FLUENT INTERFACE
  // ============================================

  withSystem(systemPrompt) {
    this._tempSystemPrompt = systemPrompt;
    return this;
  }

  withUser(userPrompt) {
    this._tempUserPrompt = userPrompt;
    return this;
  }

  withAssistant(assistantPrompt) {
    this._tempAssistantPrompt = assistantPrompt;
    return this;
  }

  withTemperature(temperature) {
    this._tempTemperature = temperature;
    return this;
  }

  withMaxTokens(maxTokens) {
    this._tempMaxTokens = maxTokens;
    return this;
  }

  async call(kwargs = {}) {
    const messages = [];
    if (this._tempSystemPrompt) messages.push(Message.system(this._tempSystemPrompt));
    if (this._tempAssistantPrompt) messages.push(Message.assistant(this._tempAssistantPrompt));
    if (!this._tempUserPrompt) throw new Error('User prompt is required. Use .withUser()');
    messages.push(Message.user(this._tempUserPrompt));

    const params = {};
    if (this._tempTemperature !== undefined) params.temperature = this._tempTemperature;
    if (this._tempMaxTokens !== undefined) params.max_tokens = this._tempMaxTokens;
    Object.assign(params, kwargs);

    this._clearTempAttrs();
    return this.generate(messages, params);
  }

  async *callStream(kwargs = {}) {
    const messages = [];
    if (this._tempSystemPrompt) messages.push(Message.system(this._tempSystemPrompt));
    if (this._tempAssistantPrompt) messages.push(Message.assistant(this._tempAssistantPrompt));
    if (!this._tempUserPrompt) throw new Error('User prompt is required. Use .withUser()');
    messages.push(Message.user(this._tempUserPrompt));

    const params = {};
    if (this._tempTemperature !== undefined) params.temperature = this._tempTemperature;
    if (this._tempMaxTokens !== undefined) params.max_tokens = this._tempMaxTokens;
    Object.assign(params, kwargs);

    this._clearTempAttrs();
    yield* this.stream(messages, params);
  }

  _clearTempAttrs() {
    delete this._tempSystemPrompt;
    delete this._tempUserPrompt;
    delete this._tempAssistantPrompt;
    delete this._tempTemperature;
    delete this._tempMaxTokens;
  }

  // ============================================
  // ASK METHODS
  // ============================================

  _getContextHistory(conversationId = null, maxPrevious = 5) {
    const name = conversationId || 'default';
    if (!this._contexts[name]) {
      this._contexts[name] = new ConversationContext(this.maxHistory);
    }
    const context = this._contexts[name];
    const conversation = context.getConversation();

    if (conversation.length > 0) {
      const userAssistantMessages = conversation.filter(m => ['user', 'assistant'].includes(m.role));
      const maxMessages = maxPrevious * 2;
      const trimmed = userAssistantMessages.length > maxMessages
        ? userAssistantMessages.slice(-maxMessages)
        : userAssistantMessages;

      const result = [];
      if (context.systemMessage) result.push(context.systemMessage);
      result.push(...trimmed);
      return result;
    }
    return conversation;
  }

  async ask(userPrompt, { systemPrompt = null, assistantContext = null, conversationId = null } = {}, kwargs = {}) {
    const messages = [];

    if (systemPrompt) messages.push(Message.system(systemPrompt));

    if (conversationId !== null || conversationId in this._contexts) {
      const history = this._getContextHistory(conversationId, 5);
      for (const msg of history) {
        if (msg.role === 'system' && systemPrompt) continue;
        messages.push(msg);
      }
    }

    if (assistantContext) messages.push(Message.assistant(assistantContext));
    messages.push(Message.user(userPrompt));

    const response = await this.generate(messages, kwargs);

    if (conversationId !== null) {
      if (!this._contexts[conversationId]) {
        this._contexts[conversationId] = new ConversationContext(this.maxHistory);
      }
      const context = this._contexts[conversationId];
      if (systemPrompt && !context.systemMessage) context.setSystemMessage(systemPrompt);
      context.addUserMessage(userPrompt);
      context.addAssistantMessage(response.content);
    }

    return response;
  }

  async *askStream(userPrompt, { systemPrompt = null, assistantContext = null, conversationId = null } = {}, kwargs = {}) {
    const messages = [];

    if (systemPrompt) messages.push(Message.system(systemPrompt));

    if (conversationId !== null || conversationId in this._contexts) {
      const history = this._getContextHistory(conversationId, 5);
      for (const msg of history) {
        if (msg.role === 'system' && systemPrompt) continue;
        messages.push(msg);
      }
    }

    if (assistantContext) messages.push(Message.assistant(assistantContext));
    messages.push(Message.user(userPrompt));

    const fullResponse = [];
    for await (const chunk of this.stream(messages, kwargs)) {
      fullResponse.push(chunk);
      yield chunk;
    }

    if (conversationId !== null) {
      if (!this._contexts[conversationId]) {
        this._contexts[conversationId] = new ConversationContext(this.maxHistory);
      }
      const context = this._contexts[conversationId];
      if (systemPrompt && !context.systemMessage) context.setSystemMessage(systemPrompt);
      context.addUserMessage(userPrompt);
      context.addAssistantMessage(fullResponse.join(''));
    }
  }

  // ============================================
  // CHAT METHODS WITH CONTEXT MEMORY
  // ============================================

  async chat(message, { sessionId = 'default', systemMessage = null, conversationId = null } = {}, kwargs = {}) {
    const convName = conversationId || sessionId;

    if (!this._contexts[convName]) {
      this._contexts[convName] = new ConversationContext(this.maxHistory);
    }
    const context = this._contexts[convName];

    if (systemMessage) context.setSystemMessage(systemMessage);
    context.addUserMessage(message);

    const conversation = context.getConversation();
    const response = await this.generate(conversation, kwargs);

    context.addAssistantMessage(response.content);
    return response;
  }

  async *chatStream(message, { sessionId = 'default', systemMessage = null, conversationId = null } = {}, kwargs = {}) {
    const convName = conversationId || sessionId;

    if (!this._contexts[convName]) {
      this._contexts[convName] = new ConversationContext(this.maxHistory);
    }
    const context = this._contexts[convName];

    if (systemMessage) context.setSystemMessage(systemMessage);
    context.addUserMessage(message);

    const conversation = context.getConversation();
    const fullResponse = [];

    for await (const chunk of this.stream(conversation, kwargs)) {
      fullResponse.push(chunk);
      yield chunk;
    }

    context.addAssistantMessage(fullResponse.join(''));
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  getConversationHistory(sessionId = 'default', conversationId = null) {
    const convName = conversationId || sessionId;
    if (!this._contexts[convName]) return [];
    return this._contexts[convName].getConversation().map(m => m.toDict());
  }

  clearConversation(sessionId = 'default', conversationId = null) {
    const convName = conversationId || sessionId;
    if (this._contexts[convName]) this._contexts[convName].clear();
  }

  resetConversation(sessionId = 'default', conversationId = null) {
    const convName = conversationId || sessionId;
    if (this._contexts[convName]) this._contexts[convName].reset();
  }

  setSystemMessage(systemMessage, sessionId = 'default', conversationId = null) {
    const convName = conversationId || sessionId;
    if (!this._contexts[convName]) {
      this._contexts[convName] = new ConversationContext(this.maxHistory);
    }
    this._contexts[convName].setSystemMessage(systemMessage);
  }

  _formatMessages(prompt) {
    if (typeof prompt === 'string') {
      return [{ role: 'user', content: prompt }];
    } else if (Array.isArray(prompt)) {
      return prompt.map(m => (m instanceof Message ? m.toDict() : m));
    } else if (prompt instanceof Message) {
      return [prompt.toDict()];
    } else {
      throw new TypeError(`Unsupported prompt type: ${typeof prompt}`);
    }
  }

  // SSE stream parser helper
  async *_parseSSEStream(response) {
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
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') return;
            yield data;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  close() {}
}

export { BaseLLM, Message, ChatResponse, ConversationContext, Deque };
