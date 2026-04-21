import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const help = {
  type: 'local-jsx',
  name: 'help',
  description: t('command.help.description'),
  load: () => import('./help.js'),
} satisfies Command

export default help
