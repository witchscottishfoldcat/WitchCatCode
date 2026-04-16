import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const plan = {
  type: 'local-jsx',
  name: 'plan',
  description: t('command.plan.description'),
  argumentHint: '[open|<description>]',
  load: () => import('./plan.js'),
} satisfies Command

export default plan
