import {
  getTotalInputTokens,
  getTotalOutputTokens,
  getTotalCostUSD,
  getTotalDuration,
  getTotalAPIDuration,
  getTotalLinesAdded,
  getTotalLinesRemoved,
  getModelUsage,
  getUsageForModel,
} from '../../bootstrap/state.js'

export type StatsOverview = {
  totalInputTokens: number
  totalOutputTokens: number
  totalCostUSD: number
  totalDurationMs: number
  totalAPIDurationMs: number
  linesAdded: number
  linesRemoved: number
  modelUsage: Record<string, { inputTokens: number; outputTokens: number }>
}

export function createStatsService() {
  return {
    getOverview(): StatsOverview {
      const modelUsageRaw = getModelUsage() ?? {}
      const modelUsage: Record<string, { inputTokens: number; outputTokens: number }> = {}

      for (const [model, usage] of Object.entries(modelUsageRaw)) {
        modelUsage[model] = {
          inputTokens: usage.inputTokens ?? 0,
          outputTokens: usage.outputTokens ?? 0,
        }
      }

      return {
        totalInputTokens: getTotalInputTokens(),
        totalOutputTokens: getTotalOutputTokens(),
        totalCostUSD: getTotalCostUSD(),
        totalDurationMs: getTotalDuration(),
        totalAPIDurationMs: getTotalAPIDuration(),
        linesAdded: getTotalLinesAdded(),
        linesRemoved: getTotalLinesRemoved(),
        modelUsage,
      }
    },
  }
}
