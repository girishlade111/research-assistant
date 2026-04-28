export const AGENT_FALLBACK_CHAINS: Record<string, FallbackChain> = {
  
  queryIntelligence: {
    tiers: [
      { platform: 'nvidia', modelId: 'mistralai/mistral-large-3-675b-instruct-2512', maxTokens: 8192 },
      { platform: 'nvidia', modelId: 'nvidia/nemotron-3-super-120b-a12b', maxTokens: 8192 },
      { platform: 'openrouter', modelId: 'openai/gpt-oss-120b:free', maxTokens: 8192 }
    ]
  },

  webSearch: {
    tiers: [
      { platform: 'nvidia', modelId: 'abacusai/dracarys-llama-3.1-70b-instruct', maxTokens: 16384 },
      { platform: 'nvidia', modelId: 'z-ai/glm4.7', maxTokens: 16384 },
      { platform: 'openrouter', modelId: 'z-ai/glm-4.5-air:free', maxTokens: 8192 }
    ]
  },

  financialAnalysis: {
    tiers: [
      { platform: 'nvidia', modelId: 'deepseek-ai/deepseek-v3.2', maxTokens: 16384 },
      { platform: 'nvidia', modelId: 'moonshotai/kimi-k2-thinking', maxTokens: 16384 },
      { platform: 'openrouter', modelId: 'openai/gpt-oss-120b:free', maxTokens: 8192 }
    ]
  },

  riskAnalysis: {
    tiers: [
      { platform: 'nvidia', modelId: 'moonshotai/kimi-k2-thinking', maxTokens: 16384 },
      { platform: 'nvidia', modelId: 'deepseek-ai/deepseek-v3.2', maxTokens: 16384 },
      { platform: 'openrouter', modelId: 'openai/gpt-oss-120b:free', maxTokens: 8192 }
    ]
  },

  marketResearch: {
    tiers: [
      { platform: 'nvidia', modelId: 'z-ai/glm4.7', maxTokens: 16384 },
      { platform: 'nvidia', modelId: 'mistralai/mistral-large-3-675b-instruct-2512', maxTokens: 16384 },
      { platform: 'openrouter', modelId: 'nvidia/nemotron-3-super-120b-a12b:free', maxTokens: 8192 }
    ]
  },

  technicalAnalysis: {
    tiers: [
      { platform: 'nvidia', modelId: 'deepseek-ai/deepseek-v3.2', maxTokens: 16384 },
      { platform: 'nvidia', modelId: 'nvidia/nemotron-3-super-120b-a12b', maxTokens: 16384 },
      { platform: 'openrouter', modelId: 'openai/gpt-oss-120b:free', maxTokens: 8192 }
    ]
  },

  codeGeneration: {
    tiers: [
      { platform: 'nvidia', modelId: 'qwen/qwen3-coder-480b-a35b-instruct', maxTokens: 16384 },
      { platform: 'nvidia', modelId: 'deepseek-ai/deepseek-v3.2', maxTokens: 16384 },
      { platform: 'openrouter', modelId: 'qwen/qwen3-coder:free', maxTokens: 8192 }
    ]
  },

  factChecking: {
    tiers: [
      { platform: 'nvidia', modelId: 'moonshotai/kimi-k2-thinking', maxTokens: 8192 },
      { platform: 'nvidia', modelId: 'mistralai/mistral-large-3-675b-instruct-2512', maxTokens: 8192 },
      { platform: 'openrouter', modelId: 'openai/gpt-oss-120b:free', maxTokens: 8192 }
    ]
  },

  summarization: {
    tiers: [
      { platform: 'nvidia', modelId: 'minimaxai/minimax-m2.7', maxTokens: 8192 },
      { platform: 'nvidia', modelId: 'z-ai/glm4.7', maxTokens: 8192 },
      { platform: 'openrouter', modelId: 'z-ai/glm-4.5-air:free', maxTokens: 8192 }
    ]
  },

  reportSynthesis: {
    tiers: [
      { platform: 'nvidia', modelId: 'nvidia/nemotron-3-super-120b-a12b', maxTokens: 32768 },
      { platform: 'nvidia', modelId: 'mistralai/mistral-large-3-675b-instruct-2512', maxTokens: 16384 },
      { platform: 'openrouter', modelId: 'nvidia/nemotron-3-super-120b-a12b:free', maxTokens: 16384 }
    ]
  }
};

export interface FallbackTier {
  platform: 'nvidia' | 'openrouter';
  modelId: string;
  maxTokens: number;
}

export interface FallbackChain {
  tiers: FallbackTier[];
}

// Error types जे next tier trigger करतात:
export const RETRYABLE_ERRORS = [
  429,  // Rate limit
  500,  // Server error
  502,  // Bad gateway
  503,  // Service unavailable
  504,  // Gateway timeout
];

export const FATAL_ERRORS = [
  400,  // Bad request — retry नको
  // 401 हटवला — key issue असेल तरी next tier try करा
];