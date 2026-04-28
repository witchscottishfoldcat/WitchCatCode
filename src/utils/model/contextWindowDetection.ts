/**
 * Model context window detection for non-Claude models.
 *
 * When users configure custom API providers (OpenAI-compatible, Gemini, GLM, etc.)
 * the default 200K context window may be wrong — some models support 1M while
 * others only support 128K or less. This module provides heuristic detection
 * based on model names so auto-compact thresholds are computed correctly.
 */

import { MODEL_CONTEXT_WINDOW_DEFAULT } from '../context.js'

/**
 * Known context window sizes for popular third-party models.
 * Values are in tokens. These are best-effort estimates; providers may
 * change limits without notice.
 *
 * Order matters: more specific patterns should come before generic ones.
 */
const KNOWN_MODEL_CONTEXT_WINDOWS: Array<{
  pattern: RegExp
  contextWindow: number
  name: string
}> = [
  // DeepSeek
  { pattern: /deepseek[\-_]?r1/i, contextWindow: 64_000, name: 'DeepSeek R1' },
  { pattern: /deepseek[\-_]?v3/i, contextWindow: 64_000, name: 'DeepSeek V3' },
  { pattern: /deepseek[\-_]?v2/i, contextWindow: 128_000, name: 'DeepSeek V2' },
  { pattern: /deepseek[\-_]?chat/i, contextWindow: 64_000, name: 'DeepSeek Chat' },
  { pattern: /deepseek/i, contextWindow: 64_000, name: 'DeepSeek' },

  // OpenAI GPT
  { pattern: /gpt[\-_]?4\.1/i, contextWindow: 1_000_000, name: 'GPT-4.1' },
  { pattern: /gpt[\-_]?4[\-_]?o[\-_]?mini/i, contextWindow: 128_000, name: 'GPT-4o mini' },
  { pattern: /gpt[\-_]?4[\-_]?o/i, contextWindow: 128_000, name: 'GPT-4o' },
  { pattern: /gpt[\-_]?4[\-_]?turbo/i, contextWindow: 128_000, name: 'GPT-4 Turbo' },
  { pattern: /gpt[\-_]?4[\-_]?32k/i, contextWindow: 32_768, name: 'GPT-4 32K' },
  { pattern: /gpt[\-_]?4/i, contextWindow: 8_192, name: 'GPT-4' },
  { pattern: /gpt[\-_]?3\.5[\-_]?turbo[\-_]?16k/i, contextWindow: 16_384, name: 'GPT-3.5 Turbo 16K' },
  { pattern: /gpt[\-_]?3\.5[\-_]?turbo/i, contextWindow: 4_096, name: 'GPT-3.5 Turbo' },
  { pattern: /gpt[\-_]?3\.5/i, contextWindow: 4_096, name: 'GPT-3.5' },
  { pattern: /o1[\-_]?mini/i, contextWindow: 128_000, name: 'o1-mini' },
  { pattern: /o1[\-_]?preview/i, contextWindow: 128_000, name: 'o1-preview' },
  { pattern: /o1/i, contextWindow: 200_000, name: 'o1' },
  { pattern: /o3[\-_]?mini/i, contextWindow: 200_000, name: 'o3-mini' },
  { pattern: /o3/i, contextWindow: 200_000, name: 'o3' },

  // Kimi (Moonshot AI)
  { pattern: /kimi[\-_]?k1\.5/i, contextWindow: 256_000, name: 'Kimi K1.5' },
  { pattern: /kimi[\-_]?k1/i, contextWindow: 128_000, name: 'Kimi K1' },
  { pattern: /kimi[\-_]?v1/i, contextWindow: 128_000, name: 'Kimi V1' },
  { pattern: /kimi[\-_]?moonshot/i, contextWindow: 128_000, name: 'Kimi Moonshot' },
  { pattern: /kimi/i, contextWindow: 128_000, name: 'Kimi' },
  { pattern: /moonshot/i, contextWindow: 128_000, name: 'Moonshot' },

  // GLM (Zhipu AI)
  { pattern: /glm[\-_]?5\.1/i, contextWindow: 128_000, name: 'GLM-5.1' },
  { pattern: /glm[\-_]?5[\-_]?turbo/i, contextWindow: 128_000, name: 'GLM-5 Turbo' },
  { pattern: /glm[\-_]?5/i, contextWindow: 128_000, name: 'GLM-5' },
  { pattern: /glm[\-_]?4\.5[\-_]?air/i, contextWindow: 128_000, name: 'GLM-4.5 Air' },
  { pattern: /glm[\-_]?4\.5/i, contextWindow: 128_000, name: 'GLM-4.5' },
  { pattern: /glm[\-_]?4[\-_]?plus/i, contextWindow: 128_000, name: 'GLM-4 Plus' },
  { pattern: /glm[\-_]?4[\-_]?9b/i, contextWindow: 128_000, name: 'GLM-4 9B' },
  { pattern: /glm[\-_]?4[\-_]?v/i, contextWindow: 8_000, name: 'GLM-4V' },
  { pattern: /glm[\-_]?4/i, contextWindow: 128_000, name: 'GLM-4' },
  { pattern: /glm/i, contextWindow: 32_000, name: 'GLM' },

  // Google Gemini
  { pattern: /gemini[\-_]?2\.5[\-_]?pro/i, contextWindow: 1_000_000, name: 'Gemini 2.5 Pro' },
  { pattern: /gemini[\-_]?2\.5[\-_]?flash/i, contextWindow: 1_000_000, name: 'Gemini 2.5 Flash' },
  { pattern: /gemini[\-_]?2[\-_]?pro/i, contextWindow: 1_000_000, name: 'Gemini 2 Pro' },
  { pattern: /gemini[\-_]?2[\-_]?flash/i, contextWindow: 1_000_000, name: 'Gemini 2 Flash' },
  { pattern: /gemini[\-_]?1\.5[\-_]?pro/i, contextWindow: 2_000_000, name: 'Gemini 1.5 Pro' },
  { pattern: /gemini[\-_]?1\.5[\-_]?flash/i, contextWindow: 1_000_000, name: 'Gemini 1.5 Flash' },
  { pattern: /gemini[\-_]?1\.0[\-_]?pro/i, contextWindow: 32_000, name: 'Gemini 1.0 Pro' },
  { pattern: /gemini[\-_]?1\.0[\-_]?ultra/i, contextWindow: 32_000, name: 'Gemini 1.0 Ultra' },
  { pattern: /gemini[\-_]?pro/i, contextWindow: 1_000_000, name: 'Gemini Pro' },
  { pattern: /gemini[\-_]?flash/i, contextWindow: 1_000_000, name: 'Gemini Flash' },
  { pattern: /gemini/i, contextWindow: 1_000_000, name: 'Gemini' },

  // Qwen (Alibaba)
  { pattern: /qwen[\-_]?3/i, contextWindow: 128_000, name: 'Qwen 3' },
  { pattern: /qwen[\-_]?2\.5/i, contextWindow: 128_000, name: 'Qwen 2.5' },
  { pattern: /qwen[\-_]?2/i, contextWindow: 128_000, name: 'Qwen 2' },
  { pattern: /qwen[\-_]?max/i, contextWindow: 32_000, name: 'Qwen Max' },
  { pattern: /qwen[\-_]?plus/i, contextWindow: 128_000, name: 'Qwen Plus' },
  { pattern: /qwen[\-_]?turbo/i, contextWindow: 128_000, name: 'Qwen Turbo' },
  { pattern: /qwen[\-_]?coder/i, contextWindow: 128_000, name: 'Qwen Coder' },
  { pattern: /qwen[\-_]?vl/i, contextWindow: 32_000, name: 'Qwen VL' },
  { pattern: /qwen/i, contextWindow: 128_000, name: 'Qwen' },

  // Llama (Meta)
  { pattern: /llama[\-_]?3[\-_]?3/i, contextWindow: 128_000, name: 'Llama 3.3' },
  { pattern: /llama[\-_]?3[\-_]?2/i, contextWindow: 128_000, name: 'Llama 3.2' },
  { pattern: /llama[\-_]?3[\-_]?1/i, contextWindow: 128_000, name: 'Llama 3.1' },
  { pattern: /llama[\-_]?3/i, contextWindow: 8_000, name: 'Llama 3' },
  { pattern: /llama[\-_]?2/i, contextWindow: 4_096, name: 'Llama 2' },
  { pattern: /llama/i, contextWindow: 128_000, name: 'Llama' },

  // Mistral
  { pattern: /mistral[\-_]?large/i, contextWindow: 128_000, name: 'Mistral Large' },
  { pattern: /mistral[\-_]?medium/i, contextWindow: 32_000, name: 'Mistral Medium' },
  { pattern: /mistral[\-_]?small/i, contextWindow: 32_000, name: 'Mistral Small' },
  { pattern: /mistral[\-_]?codestral/i, contextWindow: 32_000, name: 'Codestral' },
  { pattern: /mistral/i, contextWindow: 32_000, name: 'Mistral' },

  // Cohere
  { pattern: /command[\-_]?r[\-_]?plus/i, contextWindow: 128_000, name: 'Command R+' },
  { pattern: /command[\-_]?r/i, contextWindow: 128_000, name: 'Command R' },
  { pattern: /command/i, contextWindow: 4_096, name: 'Command' },
  { pattern: /cohere/i, contextWindow: 128_000, name: 'Cohere' },

  // Yi (01.AI)
  { pattern: /yi[\-_]?large/i, contextWindow: 32_000, name: 'Yi Large' },
  { pattern: /yi[\-_]?medium/i, contextWindow: 16_000, name: 'Yi Medium' },
  { pattern: /yi[\-_]?small/i, contextWindow: 16_000, name: 'Yi Small' },
  { pattern: /yi/i, contextWindow: 32_000, name: 'Yi' },

  // Baichuan
  { pattern: /baichuan[\-_]?4/i, contextWindow: 128_000, name: 'Baichuan 4' },
  { pattern: /baichuan[\-_]?3/i, contextWindow: 32_000, name: 'Baichuan 3' },
  { pattern: /baichuan[\-_]?2/i, contextWindow: 32_000, name: 'Baichuan 2' },
  { pattern: /baichuan/i, contextWindow: 32_000, name: 'Baichuan' },

  // StepFun
  { pattern: /step[\-_]?2/i, contextWindow: 128_000, name: 'Step-2' },
  { pattern: /step[\-_]?1/i, contextWindow: 32_000, name: 'Step-1' },
  { pattern: /stepfun/i, contextWindow: 32_000, name: 'StepFun' },

  // MiniMax
  { pattern: /minimax[\-_]?text/i, contextWindow: 8_000, name: 'MiniMax Text' },
  { pattern: /minimax/i, contextWindow: 8_000, name: 'MiniMax' },

  // Grok (xAI)
  { pattern: /grok[\-_]?3/i, contextWindow: 128_000, name: 'Grok 3' },
  { pattern: /grok[\-_]?2/i, contextWindow: 128_000, name: 'Grok 2' },
  { pattern: /grok[\-_]?1/i, contextWindow: 8_192, name: 'Grok 1' },
  { pattern: /grok/i, contextWindow: 128_000, name: 'Grok' },

  // Perplexity
  { pattern: /sonar[\-_]?reasoning[\-_]?pro/i, contextWindow: 128_000, name: 'Sonar Reasoning Pro' },
  { pattern: /sonar[\-_]?reasoning/i, contextWindow: 128_000, name: 'Sonar Reasoning' },
  { pattern: /sonar[\-_]?pro/i, contextWindow: 200_000, name: 'Sonar Pro' },
  { pattern: /sonar/i, contextWindow: 128_000, name: 'Sonar' },
  { pattern: /perplexity/i, contextWindow: 128_000, name: 'Perplexity' },

  // OpenRouter generic
  { pattern: /openrouter/i, contextWindow: 128_000, name: 'OpenRouter' },
]

/**
 * Detect context window size from a model name using heuristic patterns.
 * Returns undefined if no known pattern matches.
 */
export function detectContextWindowFromModelName(
  model: string,
): number | undefined {
  if (!model || typeof model !== 'string') {
    return undefined
  }

  const lowerModel = model.toLowerCase()

  for (const entry of KNOWN_MODEL_CONTEXT_WINDOWS) {
    if (entry.pattern.test(lowerModel)) {
      return entry.contextWindow
    }
  }

  return undefined
}

/**
 * Get a human-readable description of the detected model context window.
 * Useful for logging and UI messages.
 */
export function getDetectedModelInfo(
  model: string,
): { name: string; contextWindow: number } | undefined {
  if (!model || typeof model !== 'string') {
    return undefined
  }

  const lowerModel = model.toLowerCase()

  for (const entry of KNOWN_MODEL_CONTEXT_WINDOWS) {
    if (entry.pattern.test(lowerModel)) {
      return { name: entry.name, contextWindow: entry.contextWindow }
    }
  }

  return undefined
}

/**
 * Get context window for a model, falling through:
 * 1. Provider-configured contextWindow (user override)
 * 2. Heuristic detection from model name
 * 3. Default fallback
 *
 * This is a convenience wrapper that can be used when the full
 * getContextWindowForModel logic (with Anthropic-specific features)
 * is not needed or not available.
 */
export function getContextWindowForCustomModel(
  model: string,
  providerContextWindow?: number,
): number {
  // 1. User-configured provider context window takes highest precedence
  if (providerContextWindow && providerContextWindow > 0) {
    return providerContextWindow
  }

  // 2. Try heuristic detection
  const detected = detectContextWindowFromModelName(model)
  if (detected) {
    return detected
  }

  // 3. Fall back to default
  return MODEL_CONTEXT_WINDOW_DEFAULT
}
