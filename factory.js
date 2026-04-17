'use strict';

import { ChatOpenAI } from './providers/openai.js';
import { ChatGemini } from './providers/gemini.js';
import { ChatGroq } from './providers/groq.js';
import { ChatClaude } from './providers/claude.js';
import { ChatGrok } from './providers/grok.js';
import { ChatSarvamAI } from './providers/sarvamai.js';
import { ChatMistral } from './providers/mistral.js';
import { ChatLlama } from './providers/llama.js';
import { ChatDeepSeek } from './providers/deepseek.js';
import { ChatQwen } from './providers/qwen.js';
import { ChatKimi } from './providers/kimi.js';
import { ChatCohere } from './providers/cohere.js';
import { ChatOllama } from './providers/ollama.js';

const _PROVIDERS = {
  openai: ChatOpenAI,
  gemini: ChatGemini,
  groq: ChatGroq,
  claude: ChatClaude,
  grok: ChatGrok,
  sarvamai: ChatSarvamAI,
  mistral: ChatMistral,
  llama: ChatLlama,
  deepseek: ChatDeepSeek,
  qwen: ChatQwen,
  kimi: ChatKimi,
  cohere: ChatCohere,
  ollama: ChatOllama,
};

const _DEFAULTS = {
  openai: 'gpt-4o',
  gemini: 'gemini-2.0-flash',
  groq: 'llama-3.3-70b-versatile',
  claude: 'claude-sonnet-4-5',
  grok: 'grok-3-mini',
  sarvamai: 'sarvam-2b-v0.5',
  mistral: 'mistral-large-latest',
  llama: 'Llama-4-Maverick-17B-128E-Instruct-FP8',
  deepseek: 'deepseek-chat',
  qwen: 'qwen-plus',
  kimi: 'moonshot-v1-8k',
  cohere: 'command-a-03-2025',
  ollama: 'gemma3',
};

class LLMFactory {
  static create(provider, { model = null, apiKey = null, ...kwargs } = {}) {
    const key = provider.toLowerCase();
    const LLMClass = _PROVIDERS[key];

    if (!LLMClass) {
      throw new Error(
        `Unknown provider: "${provider}". Available: ${Object.keys(_PROVIDERS).join(', ')}`
      );
    }

    const resolvedModel = model || _DEFAULTS[key] || 'unknown';
    return new LLMClass({ model: resolvedModel, apiKey, ...kwargs });
  }

  static registerProvider(name, llmClass) {
    _PROVIDERS[name.toLowerCase()] = llmClass;
  }

  static listProviders() {
    return Object.keys(_PROVIDERS);
  }

  static getDefaultModel(provider) {
    return _DEFAULTS[provider.toLowerCase()] || null;
  }
}

export { LLMFactory };
