import { c as _c } from "react/compiler-runtime";
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Box } from '../../ink.js';
import { getInitialSettings } from '../../utils/settings/settings.js';
import { Witchcat, type WitchcatPose } from './Witchcat.js';
type Frame = {
  pose: WitchcatPose;
  offset: number;
};

function hold(pose: WitchcatPose, offset: number, frames: number): Frame[] {
  return Array.from({
    length: frames
  }, () => ({
    pose,
    offset
  }));
}

const JUMP_WAVE: readonly Frame[] = [...hold('default', 1, 2),
...hold('arms-up', 0, 3),
...hold('default', 0, 1), ...hold('default', 1, 2),
...hold('arms-up', 0, 3),
...hold('default', 0, 1)];

const LOOK_AROUND: readonly Frame[] = [...hold('look-right', 0, 5), ...hold('look-left', 0, 5), ...hold('default', 0, 1)];
const CLICK_ANIMATIONS: readonly (readonly Frame[])[] = [JUMP_WAVE, LOOK_AROUND];
const IDLE: Frame = {
  pose: 'default',
  offset: 0
};
const FRAME_MS = 60;
const incrementFrame = (i: number) => i + 1;
const WITCHCAT_HEIGHT = 3;

export function AnimatedWitchcat() {
  const $ = _c(8);
  const {
    pose,
    bounceOffset,
    onClick
  } = useWitchcatAnimation();
  let t0;
  if ($[0] !== pose) {
    t0 = <Witchcat pose={pose} />;
    $[0] = pose;
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  let t1;
  if ($[2] !== bounceOffset || $[3] !== t0) {
    t1 = <Box marginTop={bounceOffset} flexShrink={0}>{t0}</Box>;
    $[2] = bounceOffset;
    $[3] = t0;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  let t2;
  if ($[5] !== onClick || $[6] !== t1) {
    t2 = <Box height={WITCHCAT_HEIGHT} flexDirection="column" onClick={onClick}>{t1}</Box>;
    $[5] = onClick;
    $[6] = t1;
    $[7] = t2;
  } else {
    t2 = $[7];
  }
  return t2;
}
function useWitchcatAnimation(): {
  pose: WitchcatPose;
  bounceOffset: number;
  onClick: () => void;
} {
  const [reducedMotion] = useState(() => getInitialSettings().prefersReducedMotion ?? false);
  const [frameIndex, setFrameIndex] = useState(-1);
  const sequenceRef = useRef<readonly Frame[]>(JUMP_WAVE);
  const onClick = () => {
    if (reducedMotion || frameIndex !== -1) return;
    sequenceRef.current = CLICK_ANIMATIONS[Math.floor(Math.random() * CLICK_ANIMATIONS.length)]!;
    setFrameIndex(0);
  };
  useEffect(() => {
    if (frameIndex === -1) return;
    if (frameIndex >= sequenceRef.current.length) {
      setFrameIndex(-1);
      return;
    }
    const timer = setTimeout(setFrameIndex, FRAME_MS, incrementFrame);
    return () => clearTimeout(timer);
  }, [frameIndex]);
  const seq = sequenceRef.current;
  const current = frameIndex >= 0 && frameIndex < seq.length ? seq[frameIndex]! : IDLE;
  return {
    pose: current.pose,
    bounceOffset: current.offset,
    onClick
  };
}
