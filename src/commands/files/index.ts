import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const files = {
  type: 'local',
  name: 'files',
  description: t('command.files.description'),
  isEnabled: () => process.env.USER_TYPE === 'ant',
  supportsNonInteractive: true,
  load: () => import('./files.js'),
} satisfies Command

export default files
