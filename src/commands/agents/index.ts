import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const agents = {
  type: 'local-jsx',
  name: 'agents',
  description: t('command.agents.description'),
  load: () => import('./agents.js'),
} satisfies Command

export default agents
