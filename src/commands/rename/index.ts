import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const rename = {
  type: 'local-jsx',
  name: 'rename',
  description: t('command.rename.description'),
  immediate: true,
  argumentHint: '[name]',
  load: () => import('./rename.js'),
} satisfies Command

export default rename
