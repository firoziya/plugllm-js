'use strict';

/**
 * PlugLLM Type Definitions
 * Mirrors plugllm/types.py
 */

// ============================================
// ENUMS
// ============================================

const Role = Object.freeze({
  SYSTEM: 'system',
  USER: 'user',
  ASSISTANT: 'assistant',
  FUNCTION: 'function',
  TOOL: 'tool',
});

const CompletionStatus = Object.freeze({
  SUCCESS: 'success',
  PARTIAL: 'partial',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
});

// ============================================
// ERROR CLASSES
// ============================================

class LLMError extends Error {
  constructor(message) {
    super(message);
    this.name = 'LLMError';
  }
}

class AuthenticationError extends LLMError {
  constructor(message = 'API key authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

class RateLimitError extends LLMError {
  constructor(message = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

class InvalidRequestError extends LLMError {
  constructor(message = 'Invalid request parameters') {
    super(message);
    this.name = 'InvalidRequestError';
  }
}

class ModelNotFoundError extends LLMError {
  constructor(message = 'Requested model not found') {
    super(message);
    this.name = 'ModelNotFoundError';
  }
}

class TimeoutError extends LLMError {
  constructor(message = 'Request timeout') {
    super(message);
    this.name = 'TimeoutError';
  }
}

class StreamingError extends LLMError {
  constructor(message = 'Error during streaming') {
    super(message);
    this.name = 'StreamingError';
  }
}

// ============================================
// PROVIDER NAMES
// ============================================

const ProviderName = Object.freeze([
  'openai',
  'gemini',
  'groq',
  'claude',
  'grok',
  'mistral',
  'llama',
  'deepseek',
  'qwen',
  'kimi',
  'cohere',
  'sarvamai',
  'ollama',
]);

export default {
  Role,
  CompletionStatus,
  ProviderName,
  LLMError,
  AuthenticationError,
  RateLimitError,
  InvalidRequestError,
  ModelNotFoundError,
  TimeoutError,
  StreamingError,
};
