import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const tag = {
  type: 'local-jsx',
  name: 'tag',
  description: t('command.tag.description'),
  isEnabled: () => process.env.USER_TYPE === 'ant',
  argumentHint: '<tag-name>',
  load: () => import('./tag.js'),
} satisfies Command

export default tag
