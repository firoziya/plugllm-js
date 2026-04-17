'use strict';

import { generate } from './core.js';

const MAX_CONTEXT_CHARS = 32000;

const _conversationQueue = [];
let _totalLength = 0;

async function chat(message, role = 'user') {
  _addToQueue(message, role);

  const historyText = _conversationQueue
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');

  const aiReply = await generate(historyText);
  _addToQueue(aiReply, 'assistant');

  return aiReply;
}

function _addToQueue(content, role) {
  const msgLen = content.length;

  while (_totalLength + msgLen > MAX_CONTEXT_CHARS && _conversationQueue.length > 0) {
    const oldest = _conversationQueue.shift();
    _totalLength -= oldest.length;
  }

  _conversationQueue.push({ role, content, length: msgLen });
  _totalLength += msgLen;
}

function resetChat() {
  _conversationQueue.length = 0;
  _totalLength = 0;
}

export { chat, resetChat };
