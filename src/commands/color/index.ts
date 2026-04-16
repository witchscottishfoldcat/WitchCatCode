/**
 * Color command - minimal metadata only.
 * Implementation is lazy-loaded from color.ts to reduce startup time.
 */
import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const color = {
  type: 'local-jsx',
  name: 'color',
  description: t('command.color.description'),
  immediate: true,
  argumentHint: '<color|default>',
  load: () => import('./color.js'),
} satisfies Command

export default color
