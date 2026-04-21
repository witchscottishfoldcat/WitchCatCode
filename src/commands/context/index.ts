import { getIsNonInteractiveSession } from '../../bootstrap/state.js'
import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

export const context: Command = {
  name: 'context',
  description: t('command.context.description'),
  isEnabled: () => !getIsNonInteractiveSession(),
  type: 'local-jsx',
  load: () => import('./context.js'),
}

export const contextNonInteractive: Command = {
  type: 'local',
  name: 'context',
  supportsNonInteractive: true,
  description: t('command.context-noninteractive.description'),
  get isHidden() {
    return !getIsNonInteractiveSession()
  },
  isEnabled() {
    return getIsNonInteractiveSession()
  },
  load: () => import('./context-noninteractive.js'),
}
