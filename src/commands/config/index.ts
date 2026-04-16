import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const config = {
  aliases: ['settings'],
  type: 'local-jsx',
  name: 'config',
  description: t('command.config.description'),
  load: () => import('./config.js'),
} satisfies Command

export default config
