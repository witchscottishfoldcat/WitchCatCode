import type { Command } from '../../commands.js'
import { isEnvTruthy } from '../../utils/envUtils.js'
import { t } from '../../i18n/core.js'

const installGitHubApp = {
  type: 'local-jsx',
  name: 'install-github-app',
  description: t('command.install-github-app.description'),
  availability: ['claude-ai', 'console'],
  isEnabled: () => !isEnvTruthy(process.env.DISABLE_INSTALL_GITHUB_APP_COMMAND),
  load: () => import('./install-github-app.js'),
} satisfies Command

export default installGitHubApp
