import type { Command } from '../../commands.js'
import { isKeybindingCustomizationEnabled } from '../../keybindings/loadUserBindings.js'
import { t } from '../../i18n/core.js'

const keybindings = {
  name: 'keybindings',
  description: t('command.keybindings.description'),
  isEnabled: () => isKeybindingCustomizationEnabled(),
  supportsNonInteractive: false,
  type: 'local',
  load: () => import('./keybindings.js'),
} satisfies Command

export default keybindings
