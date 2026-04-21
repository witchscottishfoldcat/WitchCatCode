import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const stickers = {
  type: 'local',
  name: 'stickers',
  description: t('command.stickers.description'),
  supportsNonInteractive: false,
  load: () => import('./stickers.js'),
} satisfies Command

export default stickers
