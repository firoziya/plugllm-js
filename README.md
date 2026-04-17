# 🔌 PlugLLM - Unified LLM API Interface

[![npm version](https://img.shields.io/npm/v/plugllm.svg)](https://www.npmjs.com/package/plugllm)
[![License](https://img.shields.io/github/license/firoziya/plugllm)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/firoziya/plugllm?style=social)](https://github.com/firoziya/plugllm)

**PlugLLM** is a powerful, unified Node.js package that provides a consistent interface for 13+ Large Language Model (LLM) providers. Stop dealing with different SDKs and API formats — use one simple API for all your LLM needs.

```bash
npm install plugllm
```

## ✨ Key Features

- 🔌 **Unified API** — Same interface for all 13+ providers
- 🧠 **Context Memory** — Built-in conversation memory with deque (configurable up to 10+ messages)
- 💬 **Multiple Methods** — `generate()`, `chat()`, `ask()`, `stream()` for every use case
- 📡 **Streaming** — Real-time response streaming via async generators
- 🏭 **Factory Pattern** — Easy provider instantiation with `LLMFactory`
- 🔐 **Environment Variables** — Automatic API key detection
- 🚀 **No Vendor Lock-in** — Switch providers without code changes

---

## 🚀 Quick Start

### Method 1: Direct Provider Usage

```js
const { ChatOpenAI, Message } = require('plugllm');

const llm = new ChatOpenAI({ apiKey: 'your-key', model: 'gpt-4o' });

// Simple generation
const response = await llm.generate('What is Python?');
console.log(response.content);

// With message history
const messages = [
  Message.system('You are a helpful assistant'),
  Message.user('What is machine learning?'),
];
const response2 = await llm.generate(messages);
console.log(response2.content);
```

### Method 2: Using Factory Pattern

```js
const { LLMFactory } = require('plugllm');

const llm = LLMFactory.create('groq', { apiKey: 'your-key', model: 'llama-3.3-70b-versatile' });
const response = await llm.generate('Explain AI');
console.log(response.content);
```

### Method 3: Ask Method (Simplest)

```js
const { ChatGroq } = require('plugllm');

const llm = new ChatGroq({ apiKey: 'your-key', model: 'llama-3.3-70b-versatile' });

// Simple ask
const response = await llm.ask('What is Python?');

// With system prompt
const response2 = await llm.ask(
  'What is Python?',
  { systemPrompt: 'You are a beginner-friendly teacher. Explain simply.' }
);
console.log(response2.content);
```

---

## 💬 Chat with Context Memory

```js
const { ChatOpenAI } = require('plugllm');

const llm = new ChatOpenAI({ apiKey: 'your-key', model: 'gpt-4o', maxHistory: 10 });

const r1 = await llm.chat('My name is Alice');
console.log(r1.content);

const r2 = await llm.chat("What's my name?"); // Remembers "Alice"
console.log(r2.content);

// Multiple independent sessions
await llm.chat('I like Python', { sessionId: 'user1' });
await llm.chat('I like Java',   { sessionId: 'user2' });

const history = llm.getConversationHistory('user1');
console.log(history);
```

---

## 🌊 Streaming Responses

```js
const { ChatGroq } = require('plugllm');

const llm = new ChatGroq({ apiKey: 'your-key', model: 'llama-3.3-70b-versatile' });

// Streaming with generate
for await (const chunk of llm.stream('Tell me a story')) {
  process.stdout.write(chunk);
}

// Streaming with ask
for await (const chunk of llm.askStream('Count from 1 to 5')) {
  process.stdout.write(chunk);
}
```

---

## 🎯 Fluent Interface for Prompt Engineering

```js
const { ChatOpenAI } = require('plugllm');

const llm = new ChatOpenAI({ apiKey: 'your-key', model: 'gpt-4o' });

const response = await llm
  .withSystem('You are a helpful math tutor')
  .withUser('What is the square root of 144?')
  .withTemperature(0.5)
  .withMaxTokens(100)
  .call();

console.log(response.content);
```

---

## 🌐 Supported Providers

| Provider | Class | Default Model | Env Var |
|---|---|---|---|
| **OpenAI** | `ChatOpenAI` | gpt-4o | `OPENAI_API_KEY` |
| **Google Gemini** | `ChatGemini` | gemini-2.0-flash | `GEMINI_API_KEY` |
| **Groq** | `ChatGroq` | llama-3.3-70b-versatile | `GROQ_API_KEY` |
| **Anthropic Claude** | `ChatClaude` | claude-sonnet-4-5 | `ANTHROPIC_API_KEY` |
| **xAI Grok** | `ChatGrok` | grok-3-mini | `XAI_API_KEY` |
| **Mistral AI** | `ChatMistral` | mistral-large-latest | `MISTRAL_API_KEY` |
| **Meta Llama** | `ChatLlama` | Llama-4-Maverick-17B | `LLAMA_API_KEY` |
| **DeepSeek** | `ChatDeepSeek` | deepseek-chat | `DEEPSEEK_API_KEY` |
| **Alibaba Qwen** | `ChatQwen` | qwen-plus | `DASHSCOPE_API_KEY` |
| **Moonshot Kimi** | `ChatKimi` | moonshot-v1-8k | `MOONSHOT_API_KEY` |
| **Cohere** | `ChatCohere` | command-a-03-2025 | `CO_API_KEY` |
| **SarvamAI** | `ChatSarvamAI` | sarvam-2b-v0.5 | `SARVAM_API_KEY` |
| **Ollama (Local)** | `ChatOllama` | gemma3 | No API key needed |

---

## 🔧 Configuration

### Direct Configuration

```js
const { ChatOpenAI } = require('plugllm');

const llm = new ChatOpenAI({
  model: 'gpt-4o',
  apiKey: 'your-key',
  temperature: 0.7,
  maxTokens: 1000,
});
```

### Environment Variables

```bash
# .env
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
GROQ_API_KEY=gsk_...
ANTHROPIC_API_KEY=sk-ant-...
```

```js
// Automatically reads from environment
const llm = new ChatGroq({ model: 'llama-3.3-70b-versatile' });
```

### Factory Pattern

```js
const { LLMFactory } = require('plugllm');

const llm = LLMFactory.create('claude', {
  model: 'claude-sonnet-4-5',
  apiKey: 'your-key',
  temperature: 0.5,
});
```

---

## 📊 Usage Examples

### Building a Chatbot

```js
const { ChatOpenAI } = require('plugllm');

class ChatBot {
  constructor(apiKey) {
    this.llm = new ChatOpenAI({ apiKey, model: 'gpt-4o', maxHistory: 20 });
    this.sessionId = 'chatbot_session';
    this.llm.setSystemMessage(
      'You are a friendly AI assistant. Be helpful and concise.',
      this.sessionId
    );
  }

  async chat(userMessage) {
    const response = await this.llm.chat(userMessage, { sessionId: this.sessionId });
    return response.content;
  }

  getHistory() {
    return this.llm.getConversationHistory(this.sessionId);
  }
}

const bot = new ChatBot('your-key');
console.log(await bot.chat('Hello!'));
console.log(await bot.chat("My name is John. What's my name?")); // Remembers "John"
```

### Multi-Provider Comparison

```js
const { ChatOpenAI, ChatGemini, ChatGroq } = require('plugllm');

const providers = {
  OpenAI:  new ChatOpenAI ({ apiKey: 'key1', model: 'gpt-4o' }),
  Gemini:  new ChatGemini ({ apiKey: 'key2', model: 'gemini-2.0-flash' }),
  Groq:    new ChatGroq   ({ apiKey: 'key3', model: 'llama-3.3-70b-versatile' }),
};

const prompt = 'Explain quantum computing in one paragraph';

for (const [name, llm] of Object.entries(providers)) {
  const response = await llm.ask(prompt, {}, { max_tokens: 150 });
  console.log(`\n${name}:\n${response.content.slice(0, 200)}...`);
}
```

### Content Summarizer with Streaming

```js
const { ChatMistral } = require('plugllm');

const llm = new ChatMistral({ apiKey: 'your-key', model: 'mistral-large-latest' });

async function summarizeStreaming(text) {
  const prompt = `Summarize this text in 3 bullet points:\n\n${text}`;
  process.stdout.write('Summary: ');
  for await (const chunk of llm.askStream(prompt, {}, { temperature: 0.3 })) {
    process.stdout.write(chunk);
  }
  console.log();
}

await summarizeStreaming('Your long article text here...');
```

---

## 🔑 v1 API (Simple Config-Based)

```js
const { config, generate, chat, resetChat } = require('plugllm');

config({ provider: 'openai', apiKey: 'your-key', model: 'gpt-4o' });

// Simple generation
const reply = await generate('What is JavaScript?');
console.log(reply);

// Stateful chat with sliding context window
const r1 = await chat('My name is Bob');
const r2 = await chat('What is my name?'); // remembers Bob
resetChat(); // clears history
```

---

## 🐛 Error Handling

```js
const { ChatOpenAI } = require('plugllm');
const { AuthenticationError, RateLimitError } = require('plugllm/types');

const llm = new ChatOpenAI({ apiKey: 'your-key', model: 'gpt-4o' });

try {
  const response = await llm.ask('Hello');
  console.log(response.content);
} catch (err) {
  if (err.name === 'AuthenticationError') {
    console.error('Invalid API key.');
  } else if (err.name === 'RateLimitError') {
    console.error('Rate limit exceeded.');
  } else {
    console.error('Unexpected error:', err.message);
  }
}
```

---

## 📚 API Reference

### Core Classes

**`BaseLLM`** — Abstract base class for all providers.

**`ChatResponse`** — Unified response object:
- `content` — The generated text
- `model` — Model used
- `usage` — Token usage statistics
- `rawResponse` — Original API response
- `finishReason` — Stop reason

**`Message`** — Message factory:
- `Message.user(content)`
- `Message.assistant(content)`
- `Message.system(content)`

### Key Methods

| Method | Description |
|---|---|
| `generate(prompt, kwargs)` | Basic text generation |
| `stream(prompt, kwargs)` | Async generator streaming |
| `chat(message, opts, kwargs)` | Context-aware conversation |
| `ask(userPrompt, opts, kwargs)` | Simple Q&A with optional system prompt |
| `askStream(userPrompt, opts, kwargs)` | Streaming Q&A |
| `withSystem(prompt).withUser(prompt).call()` | Fluent interface |
| `getConversationHistory(sessionId)` | Get chat history |
| `clearConversation(sessionId)` | Clear history (keep system msg) |
| `resetConversation(sessionId)` | Full reset |
| `setSystemMessage(msg, sessionId)` | Set system prompt for session |

---

## 📄 License

MIT © [Yash Kumar Firoziya](https://github.com/firoziya)
