import { c as _c } from "react/compiler-runtime";
import * as React from 'react';
import { Box, Text } from '../../ink.js';
export type WitchcatPose = 'default' | 'arms-up' | 'look-left' | 'look-right';

type Props = {
  pose?: WitchcatPose;
};

const CAT_LINES: Record<WitchcatPose, readonly [string, string, string]> = {
  default: [
    ' /\\_/\\ ',
    '( o.o )',
    ' > ^ < ',
  ],
  'look-left': [
    ' /\\_/\\ ',
    '( •.o )',
    ' > ^ < ',
  ],
  'look-right': [
    ' /\\_/\\ ',
    '( o.• )',
    ' > ^ < ',
  ],
  'arms-up': [
    ' /\\_/\\ ',
    '( ¤ o ¤)',
    '  V   ',
  ],
};

const WITCHCAT_HEIGHT = 3;

export function Witchcat(t0) {
  const $ = _c(8);
  let t1;
  if ($[0] !== t0) {
    t1 = t0 === undefined ? {} : t0;
    $[0] = t0;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const {
    pose: t2
  } = t1;
  const pose = t2 === undefined ? "default" : t2;
  const lines = CAT_LINES[pose];
  let t3;
  if ($[2] !== lines[0]) {
    t3 = <Text color="clawd_body">{lines[0]}</Text>;
    $[2] = lines[0];
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  let t4;
  if ($[4] !== lines[1]) {
    t4 = <Text color="clawd_body">{lines[1]}</Text>;
    $[4] = lines[1];
    $[5] = t4;
  } else {
    t4 = $[5];
  }
  let t5;
  if ($[6] !== lines[2]) {
    t5 = <Text color="clawd_body">{lines[2]}</Text>;
    $[6] = lines[2];
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  return <Box flexDirection="column" height={WITCHCAT_HEIGHT}>{t3}{t4}{t5}</Box>;
}
