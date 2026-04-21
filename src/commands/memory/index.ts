import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const memory: Command = {
  type: 'local-jsx',
  name: 'memory',
  description: t('command.memory.description'),
  load: () => import('./memory.js'),
}

export default memory
