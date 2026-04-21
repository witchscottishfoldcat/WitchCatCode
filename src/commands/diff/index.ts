import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

export default {
  type: 'local-jsx',
  name: 'diff',
  description: t('command.diff.description'),
  load: () => import('./diff.js'),
} satisfies Command
