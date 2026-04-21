import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const stats = {
  type: 'local-jsx',
  name: 'stats',
  description: t('command.stats.description'),
  load: () => import('./stats.js'),
} satisfies Command

export default stats
