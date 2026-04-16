import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const rewind = {
  description: t('command.rewind.description'),
  name: 'rewind',
  aliases: ['checkpoint'],
  argumentHint: '',
  type: 'local',
  supportsNonInteractive: false,
  load: () => import('./rewind.js'),
} satisfies Command

export default rewind
