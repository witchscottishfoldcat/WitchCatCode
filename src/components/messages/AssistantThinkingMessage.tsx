import { c as _c } from "react/compiler-runtime";
import type { ThinkingBlock, ThinkingBlockParam } from '@anthropic-ai/sdk/resources/index.mjs';
import React from 'react';
import { Box, Text } from '../../ink.js';
import { CtrlOToExpand } from '../CtrlOToExpand.js';
import { Markdown } from '../Markdown.js';
import { useSettings } from '../../hooks/useSettings.js';
import { useThinkingPulse } from '../../hooks/useThinkingPulse.js';
type Props = {
  param: ThinkingBlock | ThinkingBlockParam | {
    type: 'thinking';
    thinking: string;
  };
  addMargin: boolean;
  isTranscriptMode: boolean;
  verbose: boolean;
  hideInTranscript?: boolean;
};
export function AssistantThinkingMessage(t0) {
  const $ = _c(15);
  const {
    param: t1,
    addMargin: t2,
    isTranscriptMode,
    verbose,
    hideInTranscript: t3
  } = t0;
  const {
    thinking
  } = t1;
  const addMargin = t2 === undefined ? false : t2;
  const hideInTranscript = t3 === undefined ? false : t3;
  const settings = useSettings();
  const reducedMotion = settings.prefersReducedMotion ?? false;
  const [pulseRef, symbolColor] = useThinkingPulse(true, reducedMotion);

  if (!thinking) {
    return null;
  }
  if (hideInTranscript) {
    return null;
  }
  const shouldShowFullThinking = isTranscriptMode || verbose;

  if (!shouldShowFullThinking) {
    const t4 = addMargin ? 1 : 0;
    let t5;
    if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
      t5 = <CtrlOToExpand />;
      $[0] = t5;
    } else {
      t5 = $[0];
    }
    let t6;
    if ($[1] !== symbolColor || $[2] !== t5) {
      t6 = <Text ref={pulseRef} italic={true}><Text color={symbolColor ?? undefined} dimColor={symbolColor === null}>{"\u2234"}</Text><Text dimColor={true}>{" Thinking "}</Text>{t5}</Text>;
      $[1] = symbolColor;
      $[2] = t5;
      $[3] = t6;
    } else {
      t6 = $[3];
    }
    let t7;
    if ($[4] !== t4 || $[5] !== t6) {
      t7 = <Box marginTop={t4}>{t6}</Box>;
      $[4] = t4;
      $[5] = t6;
      $[6] = t7;
    } else {
      t7 = $[6];
    }
    return t7;
  }

  const t4 = addMargin ? 1 : 0;
  let t5;
  if ($[7] !== symbolColor) {
    t5 = <Text ref={pulseRef} italic={true}><Text color={symbolColor ?? undefined} dimColor={symbolColor === null}>{"\u2234"}</Text><Text dimColor={true}>{" Thinking\u2026"}</Text></Text>;
    $[7] = symbolColor;
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  let t6;
  if ($[9] !== thinking) {
    t6 = <Box paddingLeft={2}><Markdown dimColor={true}>{thinking}</Markdown></Box>;
    $[9] = thinking;
    $[10] = t6;
  } else {
    t6 = $[10];
  }
  let t7;
  if ($[11] !== t4 || $[12] !== t5 || $[13] !== t6) {
    t7 = <Box flexDirection="column" gap={1} marginTop={t4} width="100%">{t5}{t6}</Box>;
    $[11] = t4;
    $[12] = t5;
    $[13] = t6;
    $[14] = t7;
  } else {
    t7 = $[14];
  }
  return t7;
}
