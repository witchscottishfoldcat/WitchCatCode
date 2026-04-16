import type { Command } from '../../commands.js'
import { checkStatsigFeatureGate_CACHED_MAY_BE_STALE } from '../../services/analytics/growthbook.js'
import { t } from '../../i18n/core.js'

const thinkback = {
  type: 'local-jsx',
  name: 'think-back',
  description: t('command.thinkback.description'),
  isEnabled: () =>
    checkStatsigFeatureGate_CACHED_MAY_BE_STALE('tengu_thinkback'),
  load: () => import('./thinkback.js'),
} satisfies Command

export default thinkback
