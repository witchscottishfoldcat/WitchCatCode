import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const command = {
  name: 'vim',
  description: t('command.vim.description'),
  supportsNonInteractive: false,
  type: 'local',
  load: () => import('./vim.js'),
} satisfies Command

export default command
