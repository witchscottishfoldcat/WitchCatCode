import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

export default {
  type: 'local',
  name: 'import-codex',
  description: t('command.import-codex.description'),
  supportsNonInteractive: false,
  load: () => import('./import-codex.js'),
} satisfies Command
