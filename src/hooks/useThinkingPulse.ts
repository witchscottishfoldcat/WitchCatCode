import type { DOMElement } from '../ink.js'
import { useAnimationFrame } from '../ink.js'
import { hueToRgb, toRGBColor } from '../components/Spinner/utils.js'

const GLOW_PERIOD_S = 2
const TICK_MS = 50

export function useThinkingPulse(
  enabled: boolean,
  reducedMotion: boolean,
): [ref: (element: DOMElement | null) => void, symbolColor: string | null] {
  const [ref, time] = useAnimationFrame(!enabled || reducedMotion ? null : TICK_MS)

  if (!enabled || reducedMotion) {
    return [ref, null]
  }

  const elapsedSec = time / 1000
  const hue = (elapsedSec / GLOW_PERIOD_S) * 360 % 360

  return [ref, toRGBColor(hueToRgb(hue))]
}
