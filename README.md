# 🔌 PlugLLM

<div align="center">

[![npm version](https://img.shields.io/npm/v/plugllm.svg)](https://www.npmjs.com/package/plugllm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dt/plugllm.svg)](https://www.npmjs.com/package/plugllm)
[![GitHub Stars](https://img.shields.io/github/stars/firoziya/plugllm-js?style=social)](https://github.com/firoziya/plugllm-js)
[![Node.js Version](https://img.shields.io/node/v/plugllm.svg)](https://nodejs.org)

**One API to rule them all — Unified interface for 13+ LLM providers**

[Quick Start](#-quick-start) •
[Documentation](#-documentation) •
[Supported Providers](#-supported-providers) •
[Examples](#-examples) •
[API Reference](#-api-reference)

</div>

---

## 📖 Overview

PlugLLM is a powerful, unified Node.js package that provides a consistent interface for **13+ Large Language Model (LLM) providers**. Stop dealing with different SDKs, authentication methods, and API formats — use one simple API for all your LLM needs.

### Why PlugLLM?

- **🔌 Universal Interface**: Same methods work across OpenAI, Anthropic, Google, Groq, and more
- **🧠 Built-in Memory**: Automatic conversation history management with sliding window
- **🌊 Streaming First**: Real-time token streaming with async generators
- **🏭 Zero Lock-in**: Switch providers by changing one line of code
- **📦 Lightweight**: Minimal dependencies, optimized for performance
- **🔐 Type Safe**: Full TypeScript support with comprehensive type definitions
- **⚡ Production Ready**: Battle-tested error handling and retry logic

---

## 🚀 Quick Start

### Installation

```bash
npm install plugllm
# or
yarn add plugllm
# or
pnpm add plugllm
```

### Basic Usage

```javascript
import { ChatOpenAI } from 'plugllm';

// Initialize with your API key
const llm = new ChatOpenAI({ 
  apiKey: process.env.OPENAI_API_KEY, 
  model: 'gpt-4o' 
});

// Simple generation
const response = await llm.generate('What is the capital of France?');
console.log(response.content);
// Output: The capital of France is Paris.

// With streaming
for await (const chunk of llm.stream('Tell me a short story')) {
  process.stdout.write(chunk);
}

// Conversational memory
await llm.chat('My name is Alice');
await llm.chat('What is my name?'); // Remembers "Alice"
```

### Using Different Providers

```javascript
import { LLMFactory } from 'plugllm';

// Switch providers instantly
const openai = LLMFactory.create('openai', { model: 'gpt-4o' });
const claude = LLMFactory.create('claude', { model: 'claude-sonnet-4-5' });
const groq = LLMFactory.create('groq', { model: 'llama-3.3-70b-versatile' });

// Same API for all providers
const response = await claude.ask('Explain quantum computing');
console.log(response.content);
```

---

## ✨ Key Features

### 🔌 Unified API

```javascript
import { ChatOpenAI, ChatClaude, ChatGemini, ChatGroq } from 'plugllm';

// All providers support the same methods
const providers = [
  new ChatOpenAI({ model: 'gpt-4o' }),
  new ChatClaude({ model: 'claude-sonnet-4-5' }),
  new ChatGemini({ model: 'gemini-2.0-flash' }),
  new ChatGroq({ model: 'llama-3.3-70b-versatile' })
];

// Same interface everywhere
for (const llm of providers) {
  const response = await llm.generate('Hello');
  console.log(response.content);
}
```

### 🧠 Context Memory

```javascript
import { ChatOpenAI } from 'plugllm';

const llm = new ChatOpenAI({ maxHistory: 20 }); // Keep last 20 messages

// Automatic context management
await llm.chat('I love Python programming');
await llm.chat('I also enjoy JavaScript');
await llm.chat('What programming languages did I mention?');
// Response: You mentioned Python and JavaScript

// Multiple independent sessions
await llm.chat('I prefer tea', { sessionId: 'user1' });
await llm.chat('I prefer coffee', { sessionId: 'user2' });

// Session-specific memory
const teaPreference = await llm.chat('What do I prefer?', { sessionId: 'user1' });
console.log(teaPreference.content); // "You prefer tea"
```

### 🌊 Streaming Support

```javascript
import { ChatOpenAI } from 'plugllm';

const llm = new ChatOpenAI({ model: 'gpt-4o' });

// Real-time token streaming
for await (const token of llm.stream('Write a haiku about coding')) {
  process.stdout.write(token);
  // Tokens appear as they're generated
}

// Streaming with ask method
for await (const token of llm.askStream(
  'Count from 1 to 5',
  { systemPrompt: 'You are a counter. Only output numbers.' }
)) {
  console.log(token); // 1, 2, 3, 4, 5
}
```

### 🎯 Fluent Interface

```javascript
import { ChatOpenAI } from 'plugllm';

const llm = new ChatOpenAI({ model: 'gpt-4o' });

const response = await llm
  .withSystem('You are a math tutor who explains step-by-step')
  .withUser('Solve: 2x + 5 = 13')
  .withTemperature(0.3)
  .withMaxTokens(200)
  .call();

console.log(response.content);
```

### 🔐 Environment Variable Support

```bash
# .env file
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
GEMINI_API_KEY=AIza...
GROQ_API_KEY=gsk_xxx
```

```javascript
import { ChatOpenAI } from 'plugllm';
import 'dotenv/config';

// Automatically reads from environment
const llm = new ChatOpenAI({ model: 'gpt-4o' }); // No API key needed in code
```

---

## 🌐 Supported Providers

| Provider | Class | Default Model | Environment Variable | Documentation |
|----------|-------|---------------|---------------------|---------------|
| **OpenAI** | `ChatOpenAI` | `gpt-4o` | `OPENAI_API_KEY` | [Docs](https://platform.openai.com/docs) |
| **Google Gemini** | `ChatGemini` | `gemini-2.0-flash` | `GEMINI_API_KEY` | [Docs](https://ai.google.dev/docs) |
| **Groq** | `ChatGroq` | `llama-3.3-70b-versatile` | `GROQ_API_KEY` | [Docs](https://console.groq.com/docs) |
| **Anthropic Claude** | `ChatClaude` | `claude-sonnet-4-5` | `ANTHROPIC_API_KEY` | [Docs](https://docs.anthropic.com) |
| **xAI Grok** | `ChatGrok` | `grok-3-mini` | `XAI_API_KEY` | [Docs](https://docs.x.ai) |
| **Mistral AI** | `ChatMistral` | `mistral-large-latest` | `MISTRAL_API_KEY` | [Docs](https://docs.mistral.ai) |
| **Meta Llama** | `ChatLlama` | `Llama-4-Maverick-17B` | `LLAMA_API_KEY` | [Docs](https://www.llama.com/docs) |
| **DeepSeek** | `ChatDeepSeek` | `deepseek-chat` | `DEEPSEEK_API_KEY` | [Docs](https://platform.deepseek.com/docs) |
| **Alibaba Qwen** | `ChatQwen` | `qwen-plus` | `DASHSCOPE_API_KEY` | [Docs](https://dashscope.aliyun.com) |
| **Moonshot Kimi** | `ChatKimi` | `moonshot-v1-8k` | `MOONSHOT_API_KEY` | [Docs](https://platform.moonshot.cn/docs) |
| **Cohere** | `ChatCohere` | `command-a-03-2025` | `CO_API_KEY` | [Docs](https://docs.cohere.com) |
| **SarvamAI** | `ChatSarvamAI` | `sarvam-2b-v0.5` | `SARVAM_API_KEY` | [Docs](https://docs.sarvam.ai) |
| **Ollama (Local)** | `ChatOllama` | `gemma3` | None | [Docs](https://ollama.ai/docs) |

---

## 💡 Examples

### Building a Chatbot with Session Management

```javascript
import { ChatOpenAI } from 'plugllm';

class MultiUserChatbot {
  constructor() {
    this.llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4o',
      maxHistory: 15
    });
  }

  async handleMessage(userId, message) {
    // Each user gets isolated conversation context
    const response = await this.llm.chat(message, { sessionId: userId });
    return response.content;
  }

  getUserHistory(userId) {
    return this.llm.getConversationHistory(userId);
  }

  resetUserConversation(userId) {
    this.llm.resetConversation(userId);
  }
}

// Usage
const bot = new MultiUserChatbot();

console.log(await bot.handleMessage('alice', 'Hello, I\'m Alice'));
console.log(await bot.handleMessage('bob', 'Hi, I\'m Bob'));
console.log(await bot.handleMessage('alice', 'What\'s my name?')); // Remembers Alice
console.log(await bot.handleMessage('bob', 'What\'s my name?'));   // Remembers Bob
```

### Multi-Provider Content Generation

```javascript
import { ChatOpenAI, ChatClaude, ChatGemini } from 'plugllm';

async function generateWithMultipleProviders(prompt) {
  const providers = {
    openai: new ChatOpenAI({ model: 'gpt-4o' }),
    claude: new ChatClaude({ model: 'claude-sonnet-4-5' }),
    gemini: new ChatGemini({ model: 'gemini-2.0-flash' })
  };

  const results = {};
  
  for (const [name, llm] of Object.entries(providers)) {
    try {
      const startTime = Date.now();
      const response = await llm.ask(prompt, {
        systemPrompt: 'Be concise and accurate'
      });
      const duration = Date.now() - startTime;
      
      results[name] = {
        content: response.content,
        duration: `${duration}ms`,
        tokens: response.usage.totalTokens
      };
    } catch (error) {
      results[name] = { error: error.message };
    }
  }
  
  return results;
}

// Usage
const results = await generateWithMultipleProviders('What is machine learning?');
console.table(results);
```

### Streaming Document Summarizer

```javascript
import { ChatMistral } from 'plugllm';
import fs from 'fs/promises';

class DocumentSummarizer {
  constructor() {
    this.llm = new ChatMistral({
      apiKey: process.env.MISTRAL_API_KEY,
      model: 'mistral-large-latest',
      temperature: 0.3
    });
  }

  async summarizeFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const prompt = `Summarize the following document in 3-5 bullet points:\n\n${content}`;
    
    console.log('Generating summary...\n');
    
    const summary = [];
    for await (const chunk of this.llm.askStream(prompt)) {
      process.stdout.write(chunk);
      summary.push(chunk);
    }
    
    return summary.join('');
  }

  async summarizeWithLengthControl(text, maxLength = 200) {
    const response = await this.llm.ask(
      text,
      { systemPrompt: 'Create a concise summary' },
      { max_tokens: maxLength }
    );
    
    return response.content;
  }
}

// Usage
const summarizer = new DocumentSummarizer();
await summarizer.summarizeFile('./long-article.txt');
```

### Function Calling with Structured Output

```javascript
import { ChatOpenAI, Message } from 'plugllm';

class AIAssistant {
  constructor() {
    this.llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4o',
      temperature: 0.1
    });
  }

  async extractStructuredData(text) {
    const systemPrompt = `Extract the following information from the text and return as JSON:
    - name: string
    - age: number (if mentioned)
    - occupation: string (if mentioned)
    - location: string (if mentioned)`;

    const response = await this.llm.ask(text, { systemPrompt });
    
    try {
      // Parse the JSON response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return null;
    }
  }

  async classifySentiment(text) {
    const prompt = `Classify the sentiment of this text as positive, negative, or neutral. 
    Return only the classification word.\n\nText: "${text}"`;
    
    const response = await this.llm.generate(prompt);
    return response.content.trim().toLowerCase();
  }
}

// Usage
const assistant = new AIAssistant();
const data = await assistant.extractStructuredData(
  'John Smith, a 34-year-old software engineer from Seattle, enjoys hiking.'
);
console.log(data);
// Output: { name: 'John Smith', age: 34, occupation: 'software engineer', location: 'Seattle' }
```

### Error Handling and Retry Logic

```javascript
import { ChatOpenAI } from 'plugllm';
import { RateLimitError, AuthenticationError, NetworkError } from 'plugllm/types';

class RobustLLMClient {
  constructor() {
    this.llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4o'
    });
    this.maxRetries = 3;
    this.baseDelay = 1000;
  }

  async generateWithRetry(prompt, retryCount = 0) {
    try {
      return await this.llm.generate(prompt);
    } catch (error) {
      if (retryCount >= this.maxRetries) {
        throw new Error(`Max retries (${this.maxRetries}) exceeded: ${error.message}`);
      }

      switch (error.name) {
        case 'RateLimitError':
          const delay = this.baseDelay * Math.pow(2, retryCount);
          console.log(`Rate limited. Retrying in ${delay}ms...`);
          await this.sleep(delay);
          return this.generateWithRetry(prompt, retryCount + 1);

        case 'NetworkError':
          console.log(`Network error. Retrying (${retryCount + 1}/${this.maxRetries})...`);
          await this.sleep(this.baseDelay);
          return this.generateWithRetry(prompt, retryCount + 1);

        case 'AuthenticationError':
          throw new Error('Invalid API key. Please check your credentials.');

        default:
          throw error;
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage
const client = new RobustLLMClient();
const response = await client.generateWithRetry('Explain artificial intelligence');
```

### Parallel Processing with Multiple Models

```javascript
import { LLMFactory } from 'plugllm';

async function parallelGeneration(prompt) {
  const providers = [
    { name: 'GPT-4o', llm: LLMFactory.create('openai', { model: 'gpt-4o' }) },
    { name: 'Claude', llm: LLMFactory.create('claude', { model: 'claude-sonnet-4-5' }) },
    { name: 'Gemini', llm: LLMFactory.create('gemini', { model: 'gemini-2.0-flash' }) }
  ];

  // Run all providers in parallel
  const promises = providers.map(async ({ name, llm }) => {
    const start = performance.now();
    const response = await llm.generate(prompt);
    const duration = performance.now() - start;

    return {
      provider: name,
      response: response.content,
      duration: `${duration.toFixed(0)}ms`,
      tokens: response.usage.totalTokens
    };
  });

  const results = await Promise.allSettled(promises);
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        provider: providers[index].name,
        error: result.reason.message
      };
    }
  });
}

// Usage
const results = await parallelGeneration('What are the benefits of renewable energy?');
results.forEach(r => {
  if (r.error) {
    console.log(`${r.provider}: ERROR - ${r.error}`);
  } else {
    console.log(`${r.provider}: ${r.duration}, ${r.tokens} tokens`);
    console.log(r.response.slice(0, 100) + '...\n');
  }
});
```

### Advanced Conversation Management

```javascript
import { ChatOpenAI, Message } from 'plugllm';
import fs from 'fs/promises';

class ConversationManager {
  constructor() {
    this.llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4o',
      maxHistory: 20
    });
  }

  async startNewTopic(sessionId, topic) {
    this.llm.resetConversation(sessionId);
    this.llm.setSystemMessage(
      `You are an expert on ${topic}. Provide detailed, accurate information.`,
      sessionId
    );
  }

  async askFollowUp(sessionId, question) {
    const response = await this.llm.chat(question, { sessionId });
    return response.content;
  }

  getConversationSummary(sessionId) {
    const history = this.llm.getConversationHistory(sessionId);
    const userMessages = history.filter(m => m.role === 'user').length;
    const assistantMessages = history.filter(m => m.role === 'assistant').length;
    
    return {
      totalMessages: history.length,
      userQuestions: userMessages,
      assistantResponses: assistantMessages,
      systemPrompt: history[0]?.role === 'system' ? history[0].content : null
    };
  }

  exportConversation(sessionId) {
    const history = this.llm.getConversationHistory(sessionId);
    return history.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n\n');
  }

  async saveConversation(sessionId, filePath) {
    const exportData = this.exportConversation(sessionId);
    await fs.writeFile(filePath, exportData);
  }
}

// Usage
const manager = new ConversationManager();
const sessionId = 'science-chat-001';

await manager.startNewTopic(sessionId, 'quantum physics');
console.log(await manager.askFollowUp(sessionId, 'What is quantum entanglement?'));
console.log(await manager.askFollowUp(sessionId, 'How is it used in quantum computing?'));

const summary = manager.getConversationSummary(sessionId);
console.log('Conversation stats:', summary);

// Export for saving
await manager.saveConversation(sessionId, `./chat-${sessionId}.txt`);
```

### Simple CLI Tool

```javascript
#!/usr/bin/env node

import readline from 'readline';
import { LLMFactory } from 'plugllm';
import 'dotenv/config';

class CLIAssistant {
  constructor() {
    // Read provider from command line args or default to openai
    const provider = process.argv[2] || 'openai';
    
    this.llm = LLMFactory.create(provider, {
      model: process.env[`${provider.toUpperCase()}_MODEL`]
    });
    
    this.sessionId = `cli-${Date.now()}`;
    this.setupInterface();
  }

  setupInterface() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '🤖 > '
    });
  }

  async start() {
    console.log(`
╔══════════════════════════════════════╗
║     🤖 PlugLLM CLI Assistant         ║
║  Type 'exit' to quit, 'clear' to     ║
║  reset conversation, 'save' to       ║
║  export chat history                 ║
╚══════════════════════════════════════╝
    `);

    this.llm.setSystemMessage(
      'You are a helpful CLI assistant. Be concise but thorough.',
      this.sessionId
    );

    this.rl.prompt();
    await this.handleInput();
  }

  async handleInput() {
    for await (const line of this.rl) {
      const input = line.trim();
      
      if (input.toLowerCase() === 'exit') {
        console.log('Goodbye! 👋');
        process.exit(0);
      }
      
      if (input.toLowerCase() === 'clear') {
        this.llm.clearConversation(this.sessionId);
        console.log('✨ Conversation cleared\n');
        this.rl.prompt();
        continue;
      }

      if (input.toLowerCase() === 'save') {
        const history = this.llm.getConversationHistory(this.sessionId);
        const filename = `chat-${Date.now()}.txt`;
        const fs = await import('fs');
        const content = history.map(m => `[${m.role}]: ${m.content}`).join('\n\n');
        fs.writeFileSync(filename, content);
        console.log(`💾 Chat saved to ${filename}\n`);
        this.rl.prompt();
        continue;
      }

      process.stdout.write('🤖 Thinking...');
      
      try {
        let fullResponse = '';
        process.stdout.write('\r🤖 ');
        
        for await (const chunk of this.llm.askStream(input, { sessionId: this.sessionId })) {
          process.stdout.write(chunk);
          fullResponse += chunk;
        }
        
        console.log('\n');
      } catch (error) {
        console.log('\n❌ Error:', error.message, '\n');
      }
      
      this.rl.prompt();
    }
  }
}

// Run the CLI
const cli = new CLIAssistant();
cli.start().catch(console.error);
```

### Environment Variables Example

```javascript
import { config } from 'dotenv';
import { ChatOpenAI, ChatClaude, ChatGemini } from 'plugllm';

// Load environment variables
config();

async function demonstrateEnvSupport() {
  // All these will automatically read API keys from environment
  const openai = new ChatOpenAI({ model: 'gpt-4o' });
  const claude = new ChatClaude({ model: 'claude-sonnet-4-5' });
  const gemini = new ChatGemini({ model: 'gemini-2.0-flash' });

  const prompt = 'What is 2+2?';
  
  const responses = await Promise.all([
    openai.generate(prompt),
    claude.generate(prompt),
    gemini.generate(prompt)
  ]);

  responses.forEach((response, i) => {
    const providers = ['OpenAI', 'Claude', 'Gemini'];
    console.log(`${providers[i]}: ${response.content}`);
  });
}

demonstrateEnvSupport();
```

---

## 📚 API Reference

### BaseLLM Class

Abstract base class that all provider implementations extend.

#### Constructor

```typescript
new BaseLLM(options: BaseLLMOptions)
```

```typescript
interface BaseLLMOptions {
  apiKey?: string;           // API key (reads from env if omitted)
  model?: string;            // Model identifier
  temperature?: number;      // 0-2, defaults vary by provider
  maxTokens?: number;        // Max tokens to generate
  maxHistory?: number;       // Messages to retain (default: 10)
  baseURL?: string;          // Custom API endpoint
}
```

#### Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `generate()` | `prompt: string \| Message[]`, `kwargs?: object` | `Promise<ChatResponse>` | Generate a response |
| `stream()` | `prompt: string \| Message[]`, `kwargs?: object` | `AsyncGenerator<string>` | Stream response tokens |
| `chat()` | `message: string`, `options?: ChatOptions`, `kwargs?: object` | `Promise<ChatResponse>` | Continue conversation |
| `ask()` | `userPrompt: string`, `options?: AskOptions`, `kwargs?: object` | `Promise<ChatResponse>` | Simple Q&A |
| `askStream()` | `userPrompt: string`, `options?: AskOptions`, `kwargs?: object` | `AsyncGenerator<string>` | Stream Q&A |
| `getConversationHistory()` | `sessionId?: string` | `Message[]` | Get chat history |
| `clearConversation()` | `sessionId?: string` | `void` | Clear history |
| `resetConversation()` | `sessionId?: string` | `void` | Full reset |
| `setSystemMessage()` | `message: string`, `sessionId?: string` | `void` | Set system prompt |

#### Fluent Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `withSystem(content)` | `this` | Set system message |
| `withUser(content)` | `this` | Add user message |
| `withAssistant(content)` | `this` | Add assistant message |
| `withTemperature(value)` | `this` | Set temperature |
| `withMaxTokens(value)` | `this` | Set max tokens |
| `call(kwargs?)` | `Promise<ChatResponse>` | Execute chain |

### ChatResponse Interface

```typescript
interface ChatResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  rawResponse: any;
  finishReason: 'stop' | 'length' | 'content_filter' | 'tool_calls' | null;
}
```

### Message Factory

```typescript
import { Message } from 'plugllm';

// Static methods
Message.user(content: string): Message
Message.assistant(content: string): Message
Message.system(content: string): Message

// Interface
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
```

### LLMFactory

```typescript
import { LLMFactory } from 'plugllm';

LLMFactory.create(provider: string, options?: object): BaseLLM

// Supported provider strings:
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

### Error Types

```javascript
import {
  AuthenticationError,  // Invalid API key
  RateLimitError,       // Rate limit exceeded
  ValidationError,      // Invalid parameters
  APIError,            // Provider API error
  NetworkError         // Connection issues
} from 'plugllm/types';
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in your project root:

```bash
# OpenAI
OPENAI_API_KEY=sk-proj-xxx

# Google Gemini
GEMINI_API_KEY=AIzaSyDxxx

# Groq
GROQ_API_KEY=gsk_xxx

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-api03-xxx

# xAI Grok
XAI_API_KEY=xai-xxx

# Mistral AI
MISTRAL_API_KEY=xxx

# Meta Llama
LLAMA_API_KEY=xxx

# DeepSeek
DEEPSEEK_API_KEY=xxx

# Alibaba Qwen
DASHSCOPE_API_KEY=sk-xxx

# Moonshot Kimi
MOONSHOT_API_KEY=sk-xxx

# Cohere
CO_API_KEY=xxx

# SarvamAI
SARVAM_API_KEY=xxx
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}
```

```typescript
// TypeScript usage example
import { ChatOpenAI, Message, ChatResponse } from 'plugllm';
import type { BaseLLMOptions, AskOptions } from 'plugllm';

const options: BaseLLMOptions = {
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 1000,
  maxHistory: 15
};

const llm = new ChatOpenAI(options);

const askOptions: AskOptions = {
  systemPrompt: 'You are a TypeScript expert',
  sessionId: 'ts-session'
};

const response: ChatResponse = await llm.ask(
  'What are decorators?',
  askOptions
);

console.log(response.content);
```

### ES Modules Configuration

```json
// package.json
{
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  }
}
```

```javascript
// index.js - ES Module syntax
import { ChatOpenAI, LLMFactory, Message } from 'plugllm';
import 'dotenv/config';

const llm = new ChatOpenAI({ model: 'gpt-4o' });

// Top-level await supported in ES modules
const response = await llm.generate('Hello from ES modules!');
console.log(response.content);
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Setup

```bash
# Clone the repository
git clone https://github.com/firoziya/plugllm.git
cd plugllm

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build
```

### Adding a New Provider

1. Create a new class extending `BaseLLM` in `src/providers/`
2. Implement required methods (`generate`, `stream`)
3. Add provider to `LLMFactory`
4. Add tests in `tests/providers/`
5. Update documentation

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Adding or updating tests
- `refactor:` Code refactoring
- `perf:` Performance improvements

---

## 📄 License

MIT © [Yash Kumar Firoziya](https://github.com/firoziya)

---

## 🙏 Acknowledgments

- All the amazing LLM providers for their APIs
- The open-source community for inspiration and support
- Contributors who help make PlugLLM better

---

## 🔗 Links

- [GitHub Repository](https://github.com/firoziya/plugllm-js)
- [npm Package](https://www.npmjs.com/package/plugllm)
- [Issue Tracker](https://github.com/firoziya/plugllm-js/issues)
- [Changelog](https://github.com/firoziya/plugllm/blob/main/CHANGELOG.md)

---

## 📞 Support

- **Documentation**: [Full API Docs](https://github.com/firoziya/plugllm#readme)
- **Issues**: [GitHub Issues](https://github.com/firoziya/plugllm/issues)
- **Discussions**: [GitHub Discussions](https://github.com/firoziya/plugllm/discussions)
- **Email**: ykfiroziyash@gmail.com

---

<div align="center">

**Made with ❤️ by [Yash Kumar Firoziya](https://github.com/firoziya)**

⭐ Star us on GitHub — it helps!

</div>
