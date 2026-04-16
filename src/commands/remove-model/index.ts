import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

export default {
  type: 'local',
  name: 'remove-model',
  description: t('command.remove-model.description'),
  supportsNonInteractive: false,
  load: () => import('./remove-model'),
} satisfies Command
