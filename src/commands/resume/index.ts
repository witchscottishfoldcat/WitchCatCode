import type { Command } from '../../commands.js'
import { t } from '../../i18n/core.js'

const resume: Command = {
  type: 'local-jsx',
  name: 'resume',
  description: t('command.resume.description'),
  aliases: ['continue'],
  argumentHint: '[conversation id or search term]',
  load: () => import('./resume.js'),
}

export default resume
