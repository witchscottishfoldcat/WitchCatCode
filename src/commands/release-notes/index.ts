import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const releaseNotes: Command = {
  description: t('command.release-notes.description'),
  name: 'release-notes',
  type: 'local',
  supportsNonInteractive: true,
  load: () => import('./release-notes.js'),
}

export default releaseNotes
