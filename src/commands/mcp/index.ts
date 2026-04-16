import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const mcp = {
  type: 'local-jsx',
  name: 'mcp',
  description: t('command.mcp.description'),
  immediate: true,
  argumentHint: '[enable|disable [server-name]]',
  load: () => import('./mcp.js'),
} satisfies Command

export default mcp
