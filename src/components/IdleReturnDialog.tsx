import { c as _c } from "react/compiler-runtime";
import React from 'react';
import { Box, Text } from '../ink.js';
import { useI18n } from '../hooks/useI18n.js';
import { formatTokens } from '../utils/format.js';
import { Select } from './CustomSelect/index.js';
import { Dialog } from './design-system/Dialog.js';
type IdleReturnAction = 'continue' | 'clear' | 'dismiss' | 'never';
type Props = {
  idleMinutes: number;
  totalInputTokens: number;
  onDone: (action: IdleReturnAction) => void;
};
export function IdleReturnDialog(t0) {
  const $ = _c(16);
  const {
    idleMinutes,
    totalInputTokens,
    onDone
  } = t0;
  const { t } = useI18n();
  let t1;
  if ($[0] !== idleMinutes) {
    t1 = formatIdleDuration(idleMinutes);
    $[0] = idleMinutes;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const formattedIdle = t1;
  let t2;
  if ($[2] !== totalInputTokens) {
    t2 = formatTokens(totalInputTokens);
    $[2] = totalInputTokens;
    $[3] = t2;
  } else {
    t2 = $[3];
  }
  const formattedTokens = t2;
  const t3 = t('idleReturn.title', { idle: formattedIdle, tokens: formattedTokens });
  let t4;
  if ($[4] !== onDone) {
    t4 = () => onDone("dismiss");
    $[4] = onDone;
    $[5] = t4;
  } else {
    t4 = $[5];
  }
  const t5 = <Box flexDirection="column"><Text>{t('idleReturn.hint')}</Text></Box>;
  const t6 = [{
    value: "continue" as const,
    label: t('idleReturn.continue')
  }, {
    value: "clear" as const,
    label: t('idleReturn.clear')
  }, {
    value: "never" as const,
    label: t('idleReturn.neverAsk')
  }];
  let t7;
  if ($[6] !== onDone) {
    t7 = <Select options={t6} onChange={value => onDone(value)} />;
    $[6] = onDone;
    $[7] = t7;
  } else {
    t7 = $[7];
  }
  let t8;
  if ($[8] !== t3 || $[9] !== t4 || $[10] !== t5 || $[11] !== t7) {
    t8 = <Dialog title={t3} onCancel={t4}>{t5}{t7}</Dialog>;
    $[8] = t3;
    $[9] = t4;
    $[10] = t5;
    $[11] = t7;
    $[12] = t8;
  } else {
    t8 = $[12];
  }
  return t8;
}
function formatIdleDuration(minutes: number): string {
  if (minutes < 1) {
    return '< 1m';
  }
  if (minutes < 60) {
    return `${Math.floor(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}
