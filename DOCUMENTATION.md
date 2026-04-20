# PlugLLM Documentation

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Core Concepts](#core-concepts)
  - [BaseLLM](#basellm)
  - [ChatResponse](#chatresponse)
  - [Message](#message)
- [API Reference](#api-reference)
  - [BaseLLM Class](#basellm-class)
  - [ChatResponse Interface](#chatresponse-interface)
  - [Message Factory](#message-factory)
  - [LLMFactory](#llmfactory)
  - [v1 API (Legacy)](#v1-api-legacy)
- [Provider-Specific Classes](#provider-specific-classes)
  - [ChatOpenAI](#chatopenai)
  - [ChatGemini](#chatgemini)
  - [ChatGroq](#chatgroq)
  - [ChatClaude](#chatclaude)
  - [ChatGrok](#chatgrok)
  - [ChatMistral](#chatmistral)
  - [ChatLlama](#chatllama)
  - [ChatDeepSeek](#chatdeepseek)
  - [ChatQwen](#chatqwen)
  - [ChatKimi](#chatkimi)
  - [ChatCohere](#chatcohere)
  - [ChatSarvamAI](#chatsarvamai)
  - [ChatOllama](#chatollama)
- [Error Types](#error-types)
- [Usage Examples](#usage-examples)

---

## Overview

PlugLLM provides a unified interface for interacting with multiple Large Language Model providers. It abstracts away provider-specific implementation details, offering consistent methods for generation, chat, and streaming across all supported providers.

```typescript
// TypeScript definitions are available
import { ChatOpenAI, Message, ChatResponse } from 'plugllm';
```

---

## Installation

```bash
npm install plugllm
# or
yarn add plugllm
# or
pnpm add plugllm
```

---

## Core Concepts

### BaseLLM

`BaseLLM` is an abstract class that all provider implementations extend. It defines the standard interface and shared functionality.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `model` | `string` | The model identifier being used |
| `temperature` | `number` | Sampling temperature (0-2) |
| `maxTokens` | `number` | Maximum tokens to generate |
| `maxHistory` | `number` | Maximum messages retained in conversation history |
| `apiKey` | `string` | API key for the provider |

**Methods:**

| Method | Return Type | Description |
|--------|-------------|-------------|
| `generate(prompt, kwargs)` | `Promise<ChatResponse>` | Generate a response from a prompt |
| `stream(prompt, kwargs)` | `AsyncGenerator<string>` | Stream a response token by token |
| `chat(message, options, kwargs)` | `Promise<ChatResponse>` | Continue a conversation with memory |
| `ask(userPrompt, options, kwargs)` | `Promise<ChatResponse>` | Simple Q&A with optional system prompt |
| `askStream(userPrompt, options, kwargs)` | `AsyncGenerator<string>` | Stream Q&A responses |
| `getConversationHistory(sessionId)` | `Message[]` | Retrieve conversation history |
| `clearConversation(sessionId)` | `void` | Clear history (preserves system message) |
| `resetConversation(sessionId)` | `void` | Full reset including system message |
| `setSystemMessage(message, sessionId)` | `void` | Set system prompt for a session |

---

### ChatResponse

Standardized response object returned by all generation methods.

```typescript
interface ChatResponse {
  /** The generated text content */
  content: string;
  
  /** The model used for generation */
  model: string;
  
  /** Token usage statistics */
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  
  /** Raw response from the provider API */
  rawResponse: any;
  
  /** Reason why generation stopped */
  finishReason: 'stop' | 'length' | 'content_filter' | 'tool_calls' | null;
}
```

---

### Message

Factory for creating standardized message objects used in conversation history.

```typescript
// Static factory methods
Message.user(content: string): Message
Message.assistant(content: string): Message
Message.system(content: string): Message

// Message interface
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
```

**Example:**

```js
const messages = [
  Message.system('You are a helpful assistant'),
  Message.user('What is the capital of France?'),
  Message.assistant('The capital of France is Paris.'),
  Message.user('What is its population?')
];
```

---

## API Reference

### BaseLLM Class

Abstract base class providing common functionality for all LLM providers.

#### Constructor Options

```typescript
interface BaseLLMOptions {
  /** API key for the provider (reads from env if omitted) */
  apiKey?: string;
  
  /** Model identifier */
  model?: string;
  
  /** Sampling temperature (0-2) */
  temperature?: number;
  
  /** Maximum tokens to generate */
  maxTokens?: number;
  
  /** Maximum messages retained in history (default: 10) */
  maxHistory?: number;
  
  /** Base URL for API requests (provider-specific) */
  baseURL?: string;
}
```

#### Methods

##### `generate(prompt: string | Message[], kwargs?: object): Promise<ChatResponse>`

Generates a response from a string prompt or message array.

```js
// String prompt
const response = await llm.generate('Explain quantum computing');

// Message array
const response = await llm.generate([
  Message.system('You are a physics professor'),
  Message.user('Explain quantum computing')
]);

// With provider-specific kwargs
const response = await llm.generate('Hello', { 
  top_p: 0.9,
  frequency_penalty: 0.5 
});
```

---

##### `stream(prompt: string | Message[], kwargs?: object): AsyncGenerator<string>`

Streams response tokens in real-time.

```js
for await (const chunk of llm.stream('Tell me a story')) {
  process.stdout.write(chunk);
}
```

---

##### `chat(message: string, options?: ChatOptions, kwargs?: object): Promise<ChatResponse>`

Continues a conversation with automatic context management.

```typescript
interface ChatOptions {
  /** Session identifier for isolated conversations */
  sessionId?: string;
}
```

```js
// Default session
await llm.chat('My name is Alice');
await llm.chat('What is my name?'); // Remembers context

// Multiple sessions
await llm.chat('I like Python', { sessionId: 'user1' });
await llm.chat('I like JavaScript', { sessionId: 'user2' });
```

---

##### `ask(userPrompt: string, options?: AskOptions, kwargs?: object): Promise<ChatResponse>`

Simplified Q&A method with optional system prompt.

```typescript
interface AskOptions {
  /** System prompt to set context */
  systemPrompt?: string;
  
  /** Session identifier */
  sessionId?: string;
}
```

```js
const response = await llm.ask(
  'What is machine learning?',
  { systemPrompt: 'You are a patient teacher. Explain simply.' }
);
```

---

##### `askStream(userPrompt: string, options?: AskOptions, kwargs?: object): AsyncGenerator<string>`

Streaming version of the `ask` method.

```js
for await (const chunk of llm.askStream('Count from 1 to 10')) {
  process.stdout.write(chunk);
}
```

---

##### `withSystem(prompt: string): this`

Begins a fluent chain for prompt construction.

```js
const response = await llm
  .withSystem('You are a math tutor')
  .withUser('What is the derivative of x²?')
  .withTemperature(0.3)
  .withMaxTokens(200)
  .call();
```

##### Fluent Methods

| Method | Description |
|--------|-------------|
| `withSystem(content)` | Set system message |
| `withUser(content)` | Add user message |
| `withAssistant(content)` | Add assistant message |
| `withTemperature(value)` | Set temperature |
| `withMaxTokens(value)` | Set max tokens |
| `call(kwargs)` | Execute with current chain |

---

##### `getConversationHistory(sessionId?: string): Message[]`

Retrieves the conversation history for a session.

```js
const history = llm.getConversationHistory('default');
console.log(history.map(m => `${m.role}: ${m.content}`));
```

---

##### `clearConversation(sessionId?: string): void`

Clears conversation history while preserving the system message.

```js
llm.clearConversation('default');
```

---

##### `resetConversation(sessionId?: string): void`

Completely resets conversation including system message.

```js
llm.resetConversation('default');
```

---

##### `setSystemMessage(message: string, sessionId?: string): void`

Sets or updates the system prompt for a session.

```js
llm.setSystemMessage('You are a helpful coding assistant', 'coding-session');
```

---

### LLMFactory

Factory class for creating provider instances dynamically.

#### `LLMFactory.create(provider: string, options?: object): BaseLLM`

```typescript
type Provider = 
  | 'openai' | 'chatopenai'
  | 'gemini' | 'chatgemini' | 'google'
  | 'groq' | 'chatgroq'
  | 'claude' | 'chatclaude' | 'anthropic'
  | 'grok' | 'chatgrok' | 'xai'
  | 'mistral' | 'chatmistral'
  | 'llama' | 'chatllama' | 'meta'
  | 'deepseek' | 'chatdeepseek'
  | 'qwen' | 'chatqwen' | 'alibaba'
  | 'kimi' | 'chatkimi' | 'moonshot'
  | 'cohere' | 'chatcohere'
  | 'sarvam' | 'chatsarvamai'
  | 'ollama' | 'chatollama';
```

```js
const llm = LLMFactory.create('groq', {
  apiKey: 'gsk_xxx',
  model: 'llama-3.3-70b-versatile',
  temperature: 0.7
});
```

---

### v1 API (Legacy)

Simplified API for quick prototyping.

```js
const { config, generate, chat, resetChat } = require('plugllm');

// Configure once
config({
  provider: 'openai',
  apiKey: 'sk-xxx',
  model: 'gpt-4o'
});

// Generate
const reply = await generate('What is JavaScript?');

// Stateful chat
const r1 = await chat('My name is Bob');
const r2 = await chat('What is my name?');

// Reset
resetChat();
```

---

## Provider-Specific Classes

Each provider class extends `BaseLLM` and may include provider-specific methods or properties.

### ChatOpenAI

OpenAI GPT models (GPT-4, GPT-4o, GPT-3.5).

**Environment Variable:** `OPENAI_API_KEY`

**Default Model:** `gpt-4o`

```js
const { ChatOpenAI } = require('plugllm');

const llm = new ChatOpenAI({
  apiKey: 'sk-xxx',
  model: 'gpt-4o',
  organization: 'org-xxx' // Optional
});
```

---

### ChatGemini

Google Gemini models.

**Environment Variable:** `GEMINI_API_KEY`

**Default Model:** `gemini-2.0-flash`

```js
const { ChatGemini } = require('plugllm');

const llm = new ChatGemini({
  apiKey: 'AIza...',
  model: 'gemini-2.0-flash'
});
```

---

### ChatGroq

Groq's ultra-fast inference.

**Environment Variable:** `GROQ_API_KEY`

**Default Model:** `llama-3.3-70b-versatile`

```js
const { ChatGroq } = require('plugllm');

const llm = new ChatGroq({
  apiKey: 'gsk_xxx',
  model: 'llama-3.3-70b-versatile'
});
```

---

### ChatClaude

Anthropic Claude models.

**Environment Variable:** `ANTHROPIC_API_KEY`

**Default Model:** `claude-sonnet-4-5`

```js
const { ChatClaude } = require('plugllm');

const llm = new ChatClaude({
  apiKey: 'sk-ant-xxx',
  model: 'claude-sonnet-4-5'
});
```

---

### ChatGrok

xAI Grok models.

**Environment Variable:** `XAI_API_KEY`

**Default Model:** `grok-3-mini`

```js
const { ChatGrok } = require('plugllm');

const llm = new ChatGrok({
  apiKey: 'xai-xxx',
  model: 'grok-3-mini'
});
```

---

### ChatMistral

Mistral AI models.

**Environment Variable:** `MISTRAL_API_KEY`

**Default Model:** `mistral-large-latest`

```js
const { ChatMistral } = require('plugllm');

const llm = new ChatMistral({
  apiKey: 'xxx',
  model: 'mistral-large-latest'
});
```

---

### ChatLlama

Meta Llama models via Llama API.

**Environment Variable:** `LLAMA_API_KEY`

**Default Model:** `Llama-4-Maverick-17B`

```js
const { ChatLlama } = require('plugllm');

const llm = new ChatLlama({
  apiKey: 'xxx',
  model: 'Llama-4-Maverick-17B'
});
```

---

### ChatDeepSeek

DeepSeek models.

**Environment Variable:** `DEEPSEEK_API_KEY`

**Default Model:** `deepseek-chat`

```js
const { ChatDeepSeek } = require('plugllm');

const llm = new ChatDeepSeek({
  apiKey: 'xxx',
  model: 'deepseek-chat'
});
```

---

### ChatQwen

Alibaba Qwen models.

**Environment Variable:** `DASHSCOPE_API_KEY`

**Default Model:** `qwen-plus`

```js
const { ChatQwen } = require('plugllm');

const llm = new ChatQwen({
  apiKey: 'xxx',
  model: 'qwen-plus'
});
```

---

### ChatKimi

Moonshot Kimi models.

**Environment Variable:** `MOONSHOT_API_KEY`

**Default Model:** `moonshot-v1-8k`

```js
const { ChatKimi } = require('plugllm');

const llm = new ChatKimi({
  apiKey: 'xxx',
  model: 'moonshot-v1-8k'
});
```

---

### ChatCohere

Cohere models.

**Environment Variable:** `CO_API_KEY`

**Default Model:** `command-a-03-2025`

```js
const { ChatCohere } = require('plugllm');

const llm = new ChatCohere({
  apiKey: 'xxx',
  model: 'command-a-03-2025'
});
```

---

### ChatSarvamAI

SarvamAI Indian language models.

**Environment Variable:** `SARVAM_API_KEY`

**Default Model:** `sarvam-2b-v0.5`

```js
const { ChatSarvamAI } = require('plugllm');

const llm = new ChatSarvamAI({
  apiKey: 'xxx',
  model: 'sarvam-2b-v0.5'
});
```

---

### ChatOllama

Local Ollama models.

**Environment Variable:** None required

**Default Model:** `gemma3`

**Default Base URL:** `http://localhost:11434`

```js
const { ChatOllama } = require('plugllm');

const llm = new ChatOllama({
  model: 'llama3',
  baseURL: 'http://localhost:11434'
});
```

---

## Error Types

PlugLLM provides typed errors for better error handling.

```js
const {
  AuthenticationError,
  RateLimitError,
  ValidationError,
  APIError,
  NetworkError
} = require('plugllm/types');
```

| Error Class | Description |
|-------------|-------------|
| `AuthenticationError` | Invalid or missing API key |
| `RateLimitError` | Rate limit exceeded |
| `ValidationError` | Invalid parameters or configuration |
| `APIError` | Provider API returned an error |
| `NetworkError` | Network connectivity issues |

**Example:**

```js
try {
  const response = await llm.generate('Hello');
} catch (error) {
  switch (error.name) {
    case 'AuthenticationError':
      console.error('Check your API key');
      break;
    case 'RateLimitError':
      console.error('Rate limit hit, retry after:', error.retryAfter);
      break;
    case 'ValidationError':
      console.error('Invalid parameters:', error.message);
      break;
    case 'APIError':
      console.error('Provider error:', error.statusCode, error.message);
      break;
    case 'NetworkError':
      console.error('Connection failed:', error.message);
      break;
    default:
      console.error('Unknown error:', error);
  }
}
```

---

## Usage Examples

### Multi-Turn Conversation

```js
const { ChatOpenAI, Message } = require('plugllm');

const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o'
});

async function conversation() {
  const sessionId = 'user-123';
  
  // Set context
  llm.setSystemMessage(
    'You are an expert JavaScript developer. Provide concise answers.',
    sessionId
  );
  
  // Multi-turn conversation
  const responses = [];
  
  responses.push(await llm.chat('What is a closure?', { sessionId }));
  console.log('Assistant:', responses[0].content);
  
  responses.push(await llm.chat('Give me a practical example', { sessionId }));
  console.log('Assistant:', responses[1].content);
  
  responses.push(await llm.chat('How does it relate to lexical scoping?', { sessionId }));
  console.log('Assistant:', responses[2].content);
  
  // View history
  const history = llm.getConversationHistory(sessionId);
  console.log(`Conversation length: ${history.length} messages`);
}

conversation();
```

### Streaming with Progress

```js
const { ChatGroq } = require('plugllm');

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: 'llama-3.3-70b-versatile'
});

async function streamWithProgress() {
  let tokenCount = 0;
  
  process.stdout.write('Generating: ');
  
  for await (const chunk of llm.stream('Explain the theory of relativity')) {
    tokenCount++;
    process.stdout.write(chunk);
  }
  
  console.log(`\n\nGenerated ${tokenCount} tokens`);
}

streamWithProgress();
```

### Comparing Multiple Providers

```js
const { LLMFactory } = require('plugllm');

async function compareProviders(prompt) {
  const providers = [
    { name: 'OpenAI', config: { provider: 'openai', model: 'gpt-4o' } },
    { name: 'Claude', config: { provider: 'claude', model: 'claude-sonnet-4-5' } },
    { name: 'Gemini', config: { provider: 'gemini', model: 'gemini-2.0-flash' } }
  ];
  
  const results = await Promise.all(
    providers.map(async ({ name, config }) => {
      const llm = LLMFactory.create(config.provider, config);
      const start = Date.now();
      const response = await llm.ask(prompt);
      const duration = Date.now() - start;
      
      return {
        provider: name,
        response: response.content,
        tokens: response.usage.totalTokens,
        duration: `${duration}ms`
      };
    })
  );
  
  results.forEach(r => {
    console.log(`\n=== ${r.provider} ===`);
    console.log(`Duration: ${r.duration}`);
    console.log(`Tokens: ${r.tokens}`);
    console.log(`Response: ${r.response.slice(0, 100)}...`);
  });
}

compareProviders('What is the meaning of life?');
```

### Building a Simple CLI Chatbot

```js
const readline = require('readline');
const { ChatOpenAI } = require('plugllm');

const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o'
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function chat() {
  console.log('🤖 Chatbot started. Type "exit" to quit.\n');
  
  const ask = () => {
    rl.question('You: ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        console.log('Goodbye!');
        rl.close();
        return;
      }
      
      process.stdout.write('Bot: ');
      
      for await (const chunk of llm.askStream(input)) {
        process.stdout.write(chunk);
      }
      
      console.log('\n');
      ask();
    });
  };
  
  ask();
}

chat();
```
