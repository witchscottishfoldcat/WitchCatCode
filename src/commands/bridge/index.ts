import { feature } from 'bun:bundle'
import { isBridgeEnabled } from '../../bridge/bridgeEnabled.js'
import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

function isEnabled(): boolean {
  if (!feature('BRIDGE_MODE')) {
    return false
  }
  return isBridgeEnabled()
}

const bridge = {
  type: 'local-jsx',
  name: 'remote-control',
  aliases: ['rc'],
  description: t('command.bridge.description'),
  argumentHint: '[name]',
  isEnabled,
  get isHidden() {
    return !isEnabled()
  },
  immediate: true,
  load: () => import('./bridge.js'),
} satisfies Command

export default bridge
