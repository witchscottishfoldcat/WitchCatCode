import { c as _c } from "react/compiler-runtime";
import * as React from 'react';
import { BLACK_CIRCLE } from '../constants/figures.js';
import { Box, Text } from '../ink.js';
import type { Screen } from '../screens/REPL.js';
import type { NormalizedUserMessage } from '../types/message.js';
import { getUserMessageText } from '../utils/messages.js';
import { ConfigurableShortcutHint } from './ConfigurableShortcutHint.js';
import { MessageResponse } from './MessageResponse.js';
import { useI18n } from '../hooks/useI18n.js';
type Props = {
  message: NormalizedUserMessage;
  screen: Screen;
};
export function CompactSummary(t0) {
  const $ = _c(24);
  const {
    message,
    screen
  } = t0;
  const { t } = useI18n();
  const isTranscriptMode = screen === "transcript";
  let t1;
  if ($[0] !== message) {
    t1 = getUserMessageText(message) || "";
    $[0] = message;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const textContent = t1;
  const metadata = message.summarizeMetadata;
  if (metadata) {
    let t2;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
      t2 = <Box minWidth={2}><Text color="text">{BLACK_CIRCLE}</Text></Box>;
      $[2] = t2;
    } else {
      t2 = $[2];
    }
    const summaryHeading = <Text bold={true}>{t('compactSummary.heading')}</Text>;
    let t4;
    if ($[4] !== isTranscriptMode || $[5] !== metadata) {
      t4 = !isTranscriptMode && <MessageResponse><Box flexDirection="column"><Text dimColor={true}>{t('compactSummary.summarized', { count: metadata.messagesSummarized })} {metadata.direction === "up_to" ? t('compactSummary.upToThisPoint') : t('compactSummary.fromThisPoint')}</Text>{metadata.userContext && <Text dimColor={true}>{t('compactSummary.context')}: {"\u201C"}{metadata.userContext}{"\u201D"}</Text>}<Text dimColor={true}><ConfigurableShortcutHint action="app:toggleTranscript" context="Global" fallback="ctrl+o" description={t('compactSummary.expandHistory')} parens={true} /></Text></Box></MessageResponse>;
      $[4] = isTranscriptMode;
      $[5] = metadata;
      $[6] = t4;
    } else {
      t4 = $[6];
    }
    let t5;
    if ($[7] !== isTranscriptMode || $[8] !== textContent) {
      t5 = isTranscriptMode && <MessageResponse><Text>{textContent}</Text></MessageResponse>;
      $[7] = isTranscriptMode;
      $[8] = textContent;
      $[9] = t5;
    } else {
      t5 = $[9];
    }
    let t6;
    if ($[10] !== t4 || $[11] !== t5) {
      t6 = <Box flexDirection="column" marginTop={1}><Box flexDirection="row">{t2}<Box flexDirection="column">{summaryHeading}{t4}{t5}</Box></Box></Box>;
      $[10] = t4;
      $[11] = t5;
      $[12] = t6;
    } else {
      t6 = $[12];
    }
    return t6;
  }
  let t2b;
  if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
    t2b = <Box minWidth={2}><Text color="text">{BLACK_CIRCLE}</Text></Box>;
    $[13] = t2b;
  } else {
    t2b = $[13];
  }
  let t3b;
  if ($[14] !== isTranscriptMode) {
    t3b = !isTranscriptMode && <Text dimColor={true}>{" "}<ConfigurableShortcutHint action="app:toggleTranscript" context="Global" fallback="ctrl+o" description={t('compactSummary.expand')} parens={true} /></Text>;
    $[14] = isTranscriptMode;
    $[15] = t3b;
  } else {
    t3b = $[15];
  }
  let t4b;
  if ($[16] !== t3b) {
    t4b = <Box flexDirection="row">{t2b}<Box flexDirection="column"><Text bold={true}>{t('compactSummary.compactHeading')}{t3b}</Text></Box></Box>;
    $[16] = t3b;
    $[17] = t4b;
  } else {
    t4b = $[17];
  }
  let t5b;
  if ($[18] !== isTranscriptMode || $[19] !== textContent) {
    t5b = isTranscriptMode && <MessageResponse><Text>{textContent}</Text></MessageResponse>;
    $[18] = isTranscriptMode;
    $[19] = textContent;
    $[20] = t5b;
  } else {
    t5b = $[20];
  }
  let t6b;
  if ($[21] !== t4b || $[22] !== t5b) {
    t6b = <Box flexDirection="column" marginTop={1}>{t4b}{t5b}</Box>;
    $[21] = t4b;
    $[22] = t5b;
    $[23] = t6b;
  } else {
    t6b = $[23];
  }
  return t6b;
}
