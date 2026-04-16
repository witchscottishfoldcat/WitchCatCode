import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const addDir = {
  type: 'local-jsx',
  name: 'add-dir',
  description: t('command.add-dir.description'),
  argumentHint: '<path>',
  load: () => import('./add-dir.js'),
} satisfies Command

export default addDir
