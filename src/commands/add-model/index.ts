import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

export default {
  type: 'local',
  name: 'add-model',
  description: t('command.add-model.description'),
  supportsNonInteractive: false,
  load: () => import('./add-model.js'),
} satisfies Command
