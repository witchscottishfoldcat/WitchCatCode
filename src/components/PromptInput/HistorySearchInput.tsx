import { c as _c } from "react/compiler-runtime";
import * as React from 'react';
import { stringWidth } from '../../ink/stringWidth.js';
import { Box, Text } from '../../ink.js';
import TextInput from '../TextInput.js';
import { useI18n } from '../../hooks/useI18n.js';
type Props = {
  value: string;
  onChange: (value: string) => void;
  historyFailedMatch: boolean;
};
function HistorySearchInput(t0) {
  const $ = _c(10);
  const {
    value,
    onChange,
    historyFailedMatch
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
  const t2 = historyFailedMatch ? t('promptInput.historySearch.noMatch') : t('promptInput.historySearch.searchPrompts');
  let t3;
  if ($[1] !== t2) {
    t3 = <Text dimColor={true}>{t2}</Text>;
    $[1] = t2;
    $[2] = t3;
  } else {
    t3 = $[2];
  }
  const t4 = stringWidth(value) + 1;
  let t5;
  if ($[3] !== onChange || $[4] !== t4 || $[5] !== value) {
    t5 = <TextInput value={value} onChange={onChange} cursorOffset={value.length} onChangeCursorOffset={_temp} columns={t4} focus={true} showCursor={true} multiline={false} dimColor={true} />;
    $[3] = onChange;
    $[4] = t4;
    $[5] = value;
    $[6] = t5;
  } else {
    t5 = $[6];
  }
  let t6;
  if ($[7] !== t3 || $[8] !== t5) {
    t6 = <Box gap={1}>{t3}{t5}</Box>;
    $[7] = t3;
    $[8] = t5;
    $[9] = t6;
  } else {
    t6 = $[9];
  }
  return t6;
}
function _temp() {}
export default HistorySearchInput;
