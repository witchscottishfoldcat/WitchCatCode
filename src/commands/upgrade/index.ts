import type { Command } from '../../commands.js'
import { getSubscriptionType } from '../../utils/auth.js'
import { isEnvTruthy } from '../../utils/envUtils.js'
import { t } from '../../i18n/core.js'

const upgrade = {
  type: 'local-jsx',
  name: 'upgrade',
  description: t('command.upgrade.description'),
  availability: ['claude-ai'],
  isEnabled: () =>
    !isEnvTruthy(process.env.DISABLE_UPGRADE_COMMAND) &&
    getSubscriptionType() !== 'enterprise',
  load: () => import('./upgrade.js'),
} satisfies Command

export default upgrade
