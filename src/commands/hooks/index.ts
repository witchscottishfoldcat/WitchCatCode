import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const hooks = {
  type: 'local-jsx',
  name: 'hooks',
  description: t('command.hooks.description'),
  immediate: true,
  load: () => import('./hooks.js'),
} satisfies Command

export default hooks
