import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const gui = {
  type: 'local-jsx',
  name: 'gui',
  description: t('command.gui.description'),
  isEnabled: () => true,
  load: () => import('./gui.js'),
} satisfies Command

export default gui
