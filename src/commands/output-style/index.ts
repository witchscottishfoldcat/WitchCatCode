import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const outputStyle = {
  type: 'local-jsx',
  name: 'output-style',
  description: t('command.output-style.description'),
  isHidden: true,
  load: () => import('./output-style.js'),
} satisfies Command

export default outputStyle
