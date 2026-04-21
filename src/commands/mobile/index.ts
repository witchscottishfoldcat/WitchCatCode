import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const mobile = {
  type: 'local-jsx',
  name: 'mobile',
  aliases: ['ios', 'android'],
  description: t('command.mobile.description'),
  load: () => import('./mobile.js'),
} satisfies Command

export default mobile
