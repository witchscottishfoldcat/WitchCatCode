import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const permissions = {
  type: 'local-jsx',
  name: 'permissions',
  aliases: ['allowed-tools'],
  description: t('command.permissions.description'),
  load: () => import('./permissions.js'),
} satisfies Command

export default permissions
