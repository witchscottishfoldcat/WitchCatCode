import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const exportCommand = {
  type: 'local-jsx',
  name: 'export',
  description: t('command.export.description'),
  argumentHint: '[filename]',
  load: () => import('./export.js'),
} satisfies Command

export default exportCommand
