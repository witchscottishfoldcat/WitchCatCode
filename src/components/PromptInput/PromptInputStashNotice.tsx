import { c as _c } from "react/compiler-runtime";
import figures from 'figures';
import * as React from 'react';
import { Box, Text } from 'src/ink.js';
import { useI18n } from '../../hooks/useI18n.js';
type Props = {
  hasStash: boolean;
};
export function PromptInputStashNotice(t0) {
  const $ = _c(2);
  const {
    hasStash
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
  if (!hasStash) {
    return null;
  }
  let t2;
  if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
    t2 = <Box paddingLeft={2}><Text dimColor={true}>{figures.pointerSmall} {t('promptInput.stash.stashedNotice')}</Text></Box>;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  return t2;
}
