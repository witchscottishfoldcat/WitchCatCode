import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const skills = {
  type: 'local-jsx',
  name: 'skills',
  description: t('command.skills.description'),
  load: () => import('./skills.js'),
} satisfies Command

export default skills
