import type { Command } from '../../commands.js'
import { shouldInferenceConfigCommandBeImmediate } from '../../utils/immediateCommand.js'
import { t } from '../../i18n/core.js'

export default {
  type: 'local-jsx',
  name: 'effort',
  description: t('command.effort.description'),
  argumentHint: '[low|medium|high|max|auto]',
  get immediate() {
    return shouldInferenceConfigCommandBeImmediate()
  },
  load: () => import('./effort.js'),
} satisfies Command
