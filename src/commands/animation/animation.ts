import type { LocalCommandCall } from '../../types/command.js'
import { getGlobalConfig, saveGlobalConfig } from '../../utils/config.js'
import { shouldReduceWinAnimations } from '../../utils/fullscreen.js'

type Mode = 'on' | 'off' | 'auto'

function effective(): 'on' | 'off' {
  return shouldReduceWinAnimations() ? 'off' : 'on'
}

function describeApplied(mode: Mode): string {
  switch (mode) {
    case 'on':
      return 'Animations ON · forced on (overrides auto-gate).'
    case 'off':
      return 'Animations OFF · forced off everywhere.'
    case 'auto':
      return effective() === 'off'
        ? 'Animations AUTO · currently OFF (Windows non-fullscreen — microsoft/terminal#14774 mitigation).'
        : 'Animations AUTO · currently ON.'
  }
}

function describeStatus(stored: Mode): string {
  // No-arg query: show stored override AND what's currently effective so
  // the user has the full picture before changing anything.
  const eff = effective()
  if (stored === 'auto') {
    return [
      `Animations: AUTO (no override) · currently ${eff.toUpperCase()}.`,
      'Use /animation on, /animation off, or /animation auto to change.',
    ].join('\n')
  }
  return [
    `Animations: ${stored.toUpperCase()} (forced) · currently ${eff.toUpperCase()}.`,
    'Use /animation on, /animation off, or /animation auto to change.',
  ].join('\n')
}

export const call: LocalCommandCall = async args => {
  const arg = args.trim().toLowerCase()
  const stored: Mode = getGlobalConfig().animations ?? 'auto'

  if (arg === '') {
    // No-arg: report current state, do not mutate. Toggling from 'auto'
    // would silently flip Windows users INTO forced-on (which re-introduces
    // the yank bug), so we require an explicit on/off/auto to change.
    return { type: 'text', value: describeStatus(stored) }
  }

  if (arg !== 'on' && arg !== 'off' && arg !== 'auto') {
    return {
      type: 'text',
      value: `Unknown argument "${arg}". Usage: /animation [on|off|auto] (no argument = show status)`,
    }
  }

  const next: Mode = arg
  saveGlobalConfig(prev => ({
    ...prev,
    animations: next === 'auto' ? undefined : next,
  }))

  return { type: 'text', value: describeApplied(next) }
}
