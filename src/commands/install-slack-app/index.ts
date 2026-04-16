import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const installSlackApp = {
  type: 'local',
  name: 'install-slack-app',
  description: t('command.install-slack-app.description'),
  availability: ['claude-ai'],
  supportsNonInteractive: false,
  load: () => import('./install-slack-app.js'),
} satisfies Command

export default installSlackApp
