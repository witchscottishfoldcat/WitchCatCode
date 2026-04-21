import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const exit = {
  type: 'local-jsx',
  name: 'exit',
  aliases: ['quit'],
  description: t('command.exit.description'),
  immediate: true,
  load: () => import('./exit.js'),
} satisfies Command

export default exit
