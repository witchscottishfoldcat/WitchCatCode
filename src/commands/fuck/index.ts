import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const fuck = {
  type: 'local',
  name: 'fuck',
  description: t('command.fuck.description'),
  aliases: ['nuke', 'factory-reset'],
  supportsNonInteractive: false,
  load: () => import('./fuck'),
} satisfies Command

export default fuck
