import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const tasks = {
  type: 'local-jsx',
  name: 'tasks',
  aliases: ['bashes'],
  description: t('command.tasks.description'),
  load: () => import('./tasks.js'),
} satisfies Command

export default tasks
