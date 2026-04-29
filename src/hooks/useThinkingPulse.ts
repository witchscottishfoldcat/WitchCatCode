import type { DOMElement } from '../ink.js'
import { useAnimationFrame } from '../ink.js'
import { hueToRgb, toRGBColor } from '../components/Spinner/utils.js'
import { shouldReduceWinAnimations } from '../utils/fullscreen.js'

const GLOW_PERIOD_S = 2
const TICK_MS = 50

export function useThinkingPulse(
  enabled: boolean,
  reducedMotion: boolean,
): [ref: (element: DOMElement | null) => void, symbolColor: string | null] {
  // Disable on Windows non-fullscreen: 50ms pulse re-renders stress the
  // LogUpdate diff path and amplify microsoft/terminal#14774 yank.
  const winSuppressed = shouldReduceWinAnimations()
  const inactive = !enabled || reducedMotion || winSuppressed
  const [ref, time] = useAnimationFrame(inactive ? null : TICK_MS)

  if (inactive) {
    return [ref, null]
  }

  const elapsedSec = time / 1000
  const hue = (elapsedSec / GLOW_PERIOD_S) * 360 % 360

  return [ref, toRGBColor(hueToRgb(hue))]
}
