import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const ide = {
  type: 'local-jsx',
  name: 'ide',
  description: t('command.ide.description'),
  argumentHint: '[open]',
  load: () => import('./ide.js'),
} satisfies Command

export default ide
