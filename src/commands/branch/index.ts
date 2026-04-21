import { feature } from 'bun:bundle'
import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const branch = {
  type: 'local-jsx',
  name: 'branch',
  // 'fork' alias only when /fork doesn't exist as its own command
  aliases: feature('FORK_SUBAGENT') ? [] : ['fork'],
  description: t('command.branch.description'),
  argumentHint: '[name]',
  load: () => import('./branch.js'),
} satisfies Command

export default branch
