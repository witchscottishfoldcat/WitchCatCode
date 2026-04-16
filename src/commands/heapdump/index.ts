import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const heapDump = {
  type: 'local',
  name: 'heapdump',
  description: t('command.heapdump.description'),
  isHidden: true,
  supportsNonInteractive: true,
  load: () => import('./heapdump.js'),
} satisfies Command

export default heapDump
