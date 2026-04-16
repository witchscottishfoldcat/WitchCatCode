import { c as _c } from "react/compiler-runtime";
import { feature } from 'bun:bundle';
import * as React from 'react';
import { useSettings } from '../../hooks/useSettings.js';
import { useI18n } from '../../hooks/useI18n.js';
import { Box, Text, useAnimationFrame } from '../../ink.js';
import { interpolateColor, toRGBColor } from '../Spinner/utils.js';
type Props = {
  voiceState: 'idle' | 'recording' | 'processing';
};

// Processing shimmer colors: dim gray to lighter gray (matches ThinkingShimmerText)
const PROCESSING_DIM = {
  r: 153,
  g: 153,
  b: 153
};
const PROCESSING_BRIGHT = {
  r: 185,
  g: 185,
  b: 185
};
const PULSE_PERIOD_S = 2; // 2 second period for all pulsing animations

export function VoiceIndicator(props) {
  const $ = _c(2);
  if (!feature("VOICE_MODE")) {
    return null;
  }
  let t0;
  if ($[0] !== props) {
    t0 = <VoiceIndicatorImpl {...props} />;
    $[0] = props;
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  return t0;
}
function VoiceIndicatorImpl(t0) {
  const $ = _c(3);
  const {
    voiceState
  } = t0;
  let t1;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = useI18n();
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const {
    t
  } = t1;
  switch (voiceState) {
    case "recording":
      {
        let t2;
        if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
          t2 = <Text dimColor={true}>{t('promptInput.voice.listening')}</Text>;
          $[1] = t2;
        } else {
          t2 = $[1];
        }
        return t2;
      }
    case "processing":
      {
        let t2;
        if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
          t2 = <ProcessingShimmer />;
          $[2] = t2;
        } else {
          t2 = $[2];
        }
        return t2;
      }
    case "idle":
      {
        return null;
      }
  }
}

// Static — the warmup window (~120ms between space #2 and activation)
// is too brief for a 1s-period shimmer to register, and a 50ms animation
// timer here runs concurrently with auto-repeat spaces arriving every
// 30-80ms, compounding re-renders during an already-busy window.
export function VoiceWarmupHint() {
  const $ = _c(2);
  if (!feature("VOICE_MODE")) {
    return null;
  }
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = useI18n();
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  const {
    t
  } = t0;
  let t1;
  if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = <Text dimColor={true}>{t('promptInput.voice.keepHolding')}</Text>;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  return t1;
}
function ProcessingShimmer() {
  const $ = _c(9);
  const settings = useSettings();
  const reducedMotion = settings.prefersReducedMotion ?? false;
  const [ref, time] = useAnimationFrame(reducedMotion ? null : 50);
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = useI18n();
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  const {
    t
  } = t0;
  if (reducedMotion) {
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
      t1 = <Text color="warning">{t('promptInput.voice.processing')}</Text>;
      $[1] = t1;
    } else {
      t1 = $[1];
    }
    return t1;
  }
  const elapsedSec = time / 1000;
  const opacity = (Math.sin(elapsedSec * Math.PI * 2 / PULSE_PERIOD_S) + 1) / 2;
  let t1;
  if ($[2] !== opacity) {
    t1 = toRGBColor(interpolateColor(PROCESSING_DIM, PROCESSING_BRIGHT, opacity));
    $[2] = opacity;
    $[3] = t1;
  } else {
    t1 = $[3];
  }
  const color = t1;
  let t2;
  if ($[4] !== color || $[5] !== t) {
    t2 = <Text color={color}>{t('promptInput.voice.processing')}</Text>;
    $[4] = color;
    $[5] = t;
    $[6] = t2;
  } else {
    t2 = $[6];
  }
  let t3;
  if ($[7] !== ref || $[8] !== t2) {
    t3 = <Box ref={ref}>{t2}</Box>;
    $[7] = ref;
    $[8] = t2;
    $[9] = t3;
  } else {
    t3 = $[9];
  }
  return t3;
}
