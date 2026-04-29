import { useMemo } from 'react'
import { stringWidth } from '../../ink/stringWidth.js'
import { type DOMElement, useAnimationFrame } from '../../ink.js'
import { shouldReduceWinAnimations } from '../../utils/fullscreen.js'
import type { SpinnerMode } from './types.js'

export function useShimmerAnimation(
  mode: SpinnerMode,
  message: string,
  isStalled: boolean,
): [ref: (element: DOMElement | null) => void, glimmerIndex: number] {
  const glimmerSpeed = mode === 'requesting' ? 50 : 200
  // Pass null when stalled to unsubscribe from the clock — otherwise the
  // setInterval keeps firing at 20fps even when the shimmer isn't visible.
  // Notably, if the caller never attaches `ref` (e.g. conditional JSX),
  // useTerminalViewport stays at its initial isVisible:true and the
  // viewport-pause never kicks in, so this is the only stop mechanism.
  //
  // Also unsubscribe on Windows non-fullscreen to avoid the 50ms shimmer
  // amplifying microsoft/terminal#14774 viewport yank.
  const winSuppressed = shouldReduceWinAnimations()
  const inactive = isStalled || winSuppressed
  const [ref, time] = useAnimationFrame(inactive ? null : glimmerSpeed)
  const messageWidth = useMemo(() => stringWidth(message), [message])

  if (inactive) {
    return [ref, -100]
  }

  const cyclePosition = Math.floor(time / glimmerSpeed)
  const cycleLength = messageWidth + 20

  if (mode === 'requesting') {
    return [ref, (cyclePosition % cycleLength) - 10]
  }
  return [ref, messageWidth + 10 - (cyclePosition % cycleLength)]
}
