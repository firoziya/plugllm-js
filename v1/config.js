'use strict';

const CONFIG = {
  provider: null,
  apiKey: null,
  model: null,
  baseUrl: null,
};

function config({ provider = null, apiKey = null, model = null, baseUrl = null } = {}) {
  CONFIG.provider = provider || process.env.LLM_PROVIDER || CONFIG.provider;
  CONFIG.apiKey   = apiKey   || process.env.LLM_API_KEY  || CONFIG.apiKey;
  CONFIG.model    = model    || process.env.LLM_MODEL    || CONFIG.model;
  CONFIG.baseUrl  = baseUrl  || process.env.LLM_BASE_URL || CONFIG.baseUrl;
}

export { CONFIG, config };
