import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

export default {
  type: 'local-jsx',
  name: 'usage',
  description: t('command.usage.description'),
  availability: ['claude-ai'],
  load: () => import('./usage.js'),
} satisfies Command
