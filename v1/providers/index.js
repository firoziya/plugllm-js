'use strict';

import { OpenAIProvider } from './openai.js';
import { GeminiProvider } from './gemini.js';
import { GroqProvider } from './groq.js';
import { MistralProvider } from './mistral.js';
import { ProviderBase } from './base.js';

function getProvider(name) {
  switch ((name || '').toLowerCase()) {
    case 'openai':  return new OpenAIProvider();
    case 'gemini':  return new GeminiProvider();
    case 'groq':    return new GroqProvider();
    case 'mistral': return new MistralProvider();
    default:        throw new Error(`Unknown provider: ${name}`);
  }
}

export { getProvider, ProviderBase, OpenAIProvider, GeminiProvider, GroqProvider, MistralProvider };
