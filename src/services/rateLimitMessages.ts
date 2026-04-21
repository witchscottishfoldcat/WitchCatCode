/**
 * Centralized rate limit message generation
 * Single source of truth for all rate limit-related messages
 */

import {
  getOauthAccountInfo,
  getSubscriptionType,
  isOverageProvisioningAllowed,
} from '../utils/auth.js'
import { hasClaudeAiBillingAccess } from '../utils/billing.js'
import { formatResetTime } from '../utils/format.js'
import type { ClaudeAILimits } from './claudeAiLimits.js'
import { t } from '../i18n/core.js'

const FEEDBACK_CHANNEL_ANT = '#briarpatch-cc'

/**
 * All possible rate limit error message prefixes
 * Export this to avoid fragile string matching in UI components
 */
export const RATE_LIMIT_ERROR_PREFIXES = [
  t('rateLimit.prefix.hitYour'),
  t('rateLimit.prefix.used'),
  t('rateLimit.prefix.nowUsingExtra'),
  t('rateLimit.prefix.closeTo'),
  t('rateLimit.prefix.outOfExtra'),
] as const

/**
 * Check if a message is a rate limit error
 */
export function isRateLimitErrorMessage(text: string): boolean {
  return RATE_LIMIT_ERROR_PREFIXES.some(prefix => text.startsWith(prefix))
}

export type RateLimitMessage = {
  message: string
  severity: 'error' | 'warning'
}

/**
 * Get the appropriate rate limit message based on limit state
 * Returns null if no message should be shown
 */
export function getRateLimitMessage(
  limits: ClaudeAILimits,
  model: string,
): RateLimitMessage | null {
  // Check overage scenarios first (when subscription is rejected but overage is available)
  // getUsingOverageText is rendered separately from warning.
  if (limits.isUsingOverage) {
    // Show warning if approaching overage spending limit
    if (limits.overageStatus === 'allowed_warning') {
      return {
        message: "You're close to your extra usage spending limit",
        severity: 'warning',
      }
    }
    return null
  }

  // ERROR STATES - when limits are rejected
  if (limits.status === 'rejected') {
    return { message: getLimitReachedText(limits, model), severity: 'error' }
  }

  // WARNING STATES - when approaching limits with early warning
  if (limits.status === 'allowed_warning') {
    // Only show warnings when utilization is above threshold (70%)
    // This prevents false warnings after week reset when API may send
    // allowed_warning with stale data at low usage levels
    const WARNING_THRESHOLD = 0.7
    if (
      limits.utilization !== undefined &&
      limits.utilization < WARNING_THRESHOLD
    ) {
      return null
    }

    // Don't warn non-billing Team/Enterprise users about approaching plan limits
    // if overages are enabled - they'll seamlessly roll into overage
    const subscriptionType = getSubscriptionType()
    const isTeamOrEnterprise =
      subscriptionType === 'team' || subscriptionType === 'enterprise'
    const hasExtraUsageEnabled =
      getOauthAccountInfo()?.hasExtraUsageEnabled === true

    if (
      isTeamOrEnterprise &&
      hasExtraUsageEnabled &&
      !hasClaudeAiBillingAccess()
    ) {
      return null
    }

    const text = getEarlyWarningText(limits)
    if (text) {
      return { message: text, severity: 'warning' }
    }
  }

  // No message needed
  return null
}

/**
 * Get error message for API errors (used in errors.ts)
 * Returns the message string or null if no error message should be shown
 */
export function getRateLimitErrorMessage(
  limits: ClaudeAILimits,
  model: string,
): string | null {
  const message = getRateLimitMessage(limits, model)

  // Only return error messages, not warnings
  if (message && message.severity === 'error') {
    return message.message
  }

  return null
}

/**
 * Get warning message for UI footer
 * Returns the warning message string or null if no warning should be shown
 */
export function getRateLimitWarning(
  limits: ClaudeAILimits,
  model: string,
): string | null {
  const message = getRateLimitMessage(limits, model)

  // Only return warnings for the footer - errors are shown in AssistantTextMessages
  if (message && message.severity === 'warning') {
    return message.message
  }

  // Don't show errors in the footer
  return null
}

function getLimitReachedText(limits: ClaudeAILimits, model: string): string {
  const resetsAt = limits.resetsAt
  const resetTime = resetsAt ? formatResetTime(resetsAt, true) : undefined
  const overageResetTime = limits.overageResetsAt
    ? formatResetTime(limits.overageResetsAt, true)
    : undefined
  const resetMessage = resetTime ? ` · ${t('rateLimit.resetsAt', { time: resetTime })}` : ''

  if (limits.overageStatus === 'rejected') {
    let overageResetMessage = ''
    if (resetsAt && limits.overageResetsAt) {
      if (resetsAt < limits.overageResetsAt) {
        overageResetMessage = ` · ${t('rateLimit.resetsAt', { time: resetTime })}`
      } else {
        overageResetMessage = ` · ${t('rateLimit.resetsAt', { time: overageResetTime })}`
      }
    } else if (resetTime) {
      overageResetMessage = ` · ${t('rateLimit.resetsAt', { time: resetTime })}`
    } else if (overageResetTime) {
      overageResetMessage = ` · ${t('rateLimit.resetsAt', { time: overageResetTime })}`
    }

    if (limits.overageDisabledReason === 'out_of_credits') {
      return `${t('rateLimit.outOfExtraUsage')}${overageResetMessage}`
    }

    return formatLimitReachedText(t('rateLimit.limitName.usage'), overageResetMessage, model)
  }

  if (limits.rateLimitType === 'seven_day_sonnet') {
    const subscriptionType = getSubscriptionType()
    const isProOrEnterprise =
      subscriptionType === 'pro' || subscriptionType === 'enterprise'
    const limit = isProOrEnterprise ? t('rateLimit.limitName.weekly') : t('rateLimit.limitName.sonnet')
    return formatLimitReachedText(limit, resetMessage, model)
  }

  if (limits.rateLimitType === 'seven_day_opus') {
    return formatLimitReachedText(t('rateLimit.limitName.opus'), resetMessage, model)
  }

  if (limits.rateLimitType === 'seven_day') {
    return formatLimitReachedText(t('rateLimit.limitName.weekly'), resetMessage, model)
  }

  if (limits.rateLimitType === 'five_hour') {
    return formatLimitReachedText(t('rateLimit.limitName.session'), resetMessage, model)
  }

  return formatLimitReachedText(t('rateLimit.limitName.usage'), resetMessage, model)
}

function getEarlyWarningText(limits: ClaudeAILimits): string | null {
  let limitName: string | null = null
  switch (limits.rateLimitType) {
    case 'seven_day':
      limitName = t('rateLimit.limitName.weekly')
      break
    case 'five_hour':
      limitName = t('rateLimit.limitName.session')
      break
    case 'seven_day_opus':
      limitName = t('rateLimit.limitName.opus')
      break
    case 'seven_day_sonnet':
      limitName = t('rateLimit.limitName.sonnet')
      break
    case 'overage':
      limitName = t('rateLimit.limitName.extraUsage')
      break
    case undefined:
      return null
  }

  const used = limits.utilization
    ? Math.floor(limits.utilization * 100)
    : undefined
  const resetTime = limits.resetsAt
    ? formatResetTime(limits.resetsAt, true)
    : undefined

  const upsell = getWarningUpsellText(limits.rateLimitType)

  if (used && resetTime) {
    const base = t('rateLimit.usedPercent.withReset', { used, limitName, resetTime })
    return upsell ? `${base} · ${upsell}` : base
  }

  if (used) {
    const base = t('rateLimit.usedPercent.withoutReset', { used, limitName })
    return upsell ? `${base} · ${upsell}` : base
  }

  if (limits.rateLimitType === 'overage') {
    limitName += ` ${t('rateLimit.limitName.limit')}`
  }

  if (resetTime) {
    const base = t('rateLimit.approaching.withReset', { limitName, resetTime })
    return upsell ? `${base} · ${upsell}` : base
  }

  const base = t('rateLimit.approaching.withoutReset', { limitName })
  return upsell ? `${base} · ${upsell}` : base
}

/**
 * Get the upsell command text for warning messages based on subscription and limit type.
 * Returns null if no upsell should be shown.
 * Only used for warnings because actual rate limit hits will see an interactive menu of options.
 */
function getWarningUpsellText(
  rateLimitType: ClaudeAILimits['rateLimitType'],
): string | null {
  const subscriptionType = getSubscriptionType()
  const hasExtraUsageEnabled =
    getOauthAccountInfo()?.hasExtraUsageEnabled === true

  if (rateLimitType === 'five_hour') {
    if (subscriptionType === 'team' || subscriptionType === 'enterprise') {
      if (!hasExtraUsageEnabled && isOverageProvisioningAllowed()) {
        return t('rateLimit.upsell.extraUsage')
      }
      return null
    }

    if (subscriptionType === 'pro' || subscriptionType === 'max') {
      return t('rateLimit.upsell.upgrade')
    }
  }

  if (rateLimitType === 'overage') {
    if (subscriptionType === 'team' || subscriptionType === 'enterprise') {
      if (!hasExtraUsageEnabled && isOverageProvisioningAllowed()) {
        return t('rateLimit.upsell.extraUsage')
      }
    }
  }

  return null
}

/**
 * Get notification text for overage mode transitions
 * Used for transient notifications when entering overage mode
 */
export function getUsingOverageText(limits: ClaudeAILimits): string {
  const resetTime = limits.resetsAt
    ? formatResetTime(limits.resetsAt, true)
    : ''

  let limitName = ''
  if (limits.rateLimitType === 'five_hour') {
    limitName = t('rateLimit.limitName.session')
  } else if (limits.rateLimitType === 'seven_day') {
    limitName = t('rateLimit.limitName.weekly')
  } else if (limits.rateLimitType === 'seven_day_opus') {
    limitName = t('rateLimit.limitName.opus')
  } else if (limits.rateLimitType === 'seven_day_sonnet') {
    const subscriptionType = getSubscriptionType()
    const isProOrEnterprise =
      subscriptionType === 'pro' || subscriptionType === 'enterprise'
    limitName = isProOrEnterprise ? t('rateLimit.limitName.weekly') : t('rateLimit.limitName.sonnet')
  }

  if (!limitName) {
    return t('rateLimit.nowUsingExtraUsage')
  }

  const resetMessage = resetTime
    ? ` · ${t('rateLimit.limitResets', { limitName, resetTime })}`
    : ''
  return `${t('rateLimit.nowUsingExtraUsage')}${resetMessage}`
}

function formatLimitReachedText(
  limit: string,
  resetMessage: string,
  _model: string,
): string {
  if (process.env.USER_TYPE === 'ant') {
    return t('rateLimit.hitLimit.ant', { limit: `${limit}${resetMessage}`, channel: FEEDBACK_CHANNEL_ANT })
  }

  return t('rateLimit.hitLimit', { limit: `${limit}${resetMessage}` })
}
