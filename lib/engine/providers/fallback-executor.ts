import { AGENT_FALLBACK_CHAINS, RETRYABLE_ERRORS, FallbackTier } from '../config/fallback-config';
import { callNvidiaModel } from './nvidia';
import { callOpenRouterModel } from './openrouter';

export interface AICallParams {
  systemPrompt: string;
  userMessage: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AICallResult {
  content: string;
  modelUsed: string;
  platform: string;
  tierUsed: number;       // 1, 2, or 3
  isFallback: boolean;
  latencyMs: number;
  tokensUsed: number;
  allTierResults: TierAttempt[];
}

export interface TierAttempt {
  tier: number;
  platform: string;
  modelId: string;
  success: boolean;
  errorCode?: number;
  errorMessage?: string;
  latencyMs: number;
}

export async function executeWithFallback(
  agentType: keyof typeof AGENT_FALLBACK_CHAINS,
  params: AICallParams
): Promise<AICallResult> {

  const chain = AGENT_FALLBACK_CHAINS[agentType];
  if (!chain) throw new Error(`No fallback chain defined for: ${agentType}`);

  const allTierResults: TierAttempt[] = [];
  
  for (let tierIndex = 0; tierIndex < chain.tiers.length; tierIndex++) {
    const tier = chain.tiers[tierIndex];
    const tierNumber = tierIndex + 1;
    const startTime = Date.now();

    console.log(`[Fallback] Tier ${tierNumber} attempt:`, {
      agentType,
      platform: tier.platform,
      model: tier.modelId
    });

    try {
      const result = await callModelByPlatform(tier, params);
      const latencyMs = Date.now() - startTime;

      const tierAttempt: TierAttempt = {
        tier: tierNumber,
        platform: tier.platform,
        modelId: tier.modelId,
        success: true,
        latencyMs
      };
      allTierResults.push(tierAttempt);

      console.log(`[Fallback] ✅ Tier ${tierNumber} SUCCESS:`, {
        model: tier.modelId,
        latencyMs
      });

      return {
        content: result.content,
        modelUsed: tier.modelId,
        platform: tier.platform,
        tierUsed: tierNumber,
        isFallback: tierNumber > 1,
        latencyMs,
        tokensUsed: result.tokensUsed || 0,
        allTierResults
      };

    } catch (error: any) {
      const latencyMs = Date.now() - startTime;
      const errorCode = error?.status || error?.statusCode || 0;
      const errorMessage = error?.message || 'Unknown error';

      const tierAttempt: TierAttempt = {
        tier: tierNumber,
        platform: tier.platform,
        modelId: tier.modelId,
        success: false,
        errorCode,
        errorMessage,
        latencyMs
      };
      allTierResults.push(tierAttempt);

      console.warn(`[Fallback] ❌ Tier ${tierNumber} FAILED:`, {
        model: tier.modelId,
        errorCode,
        errorMessage
      });

      const isLastTier = tierIndex === chain.tiers.length - 1;
      
      if (isLastTier) {
        console.error(`[Fallback] 💀 ALL TIERS FAILED for ${agentType}:`, 
          allTierResults.map(t => `Tier${t.tier}:${t.errorCode}`)
        );
        
        return {
          content: '',
          modelUsed: 'none',
          platform: 'none',
          tierUsed: 0,
          isFallback: true,
          latencyMs: Date.now() - startTime,
          tokensUsed: 0,
          allTierResults
        };
      }

      const delay = tierIndex === 0 ? 500 : 1000;
      console.log(`[Fallback] Waiting ${delay}ms before Tier ${tierNumber + 1}...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  throw new Error('Fallback chain exhausted');
}

async function callModelByPlatform(
  tier: FallbackTier,
  params: AICallParams
): Promise<{ content: string; tokensUsed: number }> {
  
  const callParams = {
    ...params,
    maxTokens: params.maxTokens || tier.maxTokens,
    modelId: tier.modelId
  };

  if (tier.platform === 'nvidia') {
    return await callNvidiaModel(callParams);
  } else if (tier.platform === 'openrouter') {
    return await callOpenRouterModel(callParams);
  }
  
  throw new Error(`Unknown platform: ${tier.platform}`);
}