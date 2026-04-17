'use strict';

/**
 * PlugLLM - Unified LLM API Interface
 * @version 0.0.1
 */

// v1 imports
import { config, generate, chat, resetChat } from './v1/index.js';

// v2 imports
import { BaseLLM, Message, ChatResponse } from './base.js';
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
import { LLMFactory } from './factory.js'; 

const version = '0.0.1';

// Named exports
export {
  // v1
  config,
  generate,
  chat,
  resetChat,
  // v2 base
  BaseLLM,
  Message,
  ChatResponse,
  // v2 providers
  ChatOpenAI,
  ChatGemini,
  ChatGroq,
  ChatClaude,
  ChatGrok,
  ChatSarvamAI,
  ChatMistral,
  ChatLlama,
  ChatDeepSeek,
  ChatQwen,
  ChatKimi,
  ChatCohere,
  ChatOllama,
  // factory
  LLMFactory,
};

// Default export
export default {
  config,
  generate,
  chat,
  resetChat,
  BaseLLM,
  Message,
  ChatResponse,
  ChatOpenAI,
  ChatGemini,
  ChatGroq,
  ChatClaude,
  ChatGrok,
  ChatSarvamAI,
  ChatMistral,
  ChatLlama,
  ChatDeepSeek,
  ChatQwen,
  ChatKimi,
  ChatCohere,
  ChatOllama,
  LLMFactory,
  version,
};
