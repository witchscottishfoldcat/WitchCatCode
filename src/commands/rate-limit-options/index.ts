import type { Command } from '../../commands.js'
import { isClaudeAISubscriber } from '../../utils/auth.js'
import { t } from '../../i18n/core.js'

const rateLimitOptions = {
  type: 'local-jsx',
  name: 'rate-limit-options',
  description: t('command.rate-limit-options.description'),
  isEnabled: () => {
    if (!isClaudeAISubscriber()) {
      return false
    }

    return true
  },
  isHidden: true, // Hidden from help - only used internally
  load: () => import('./rate-limit-options.js'),
} satisfies Command

export default rateLimitOptions
