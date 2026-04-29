import type { Command } from '../../commands.js'

const command = {
  name: 'animation',
  description:
    'Toggle high-frequency UI animations (thinking pulse, spinner shimmer, buddy tick). Useful on Windows consoles that hit microsoft/terminal#14774.',
  argumentHint: '[on|off|auto]',
  supportsNonInteractive: false,
  type: 'local',
  load: () => import('./animation.js'),
} satisfies Command

export default command
