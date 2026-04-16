import { c as _c } from "react/compiler-runtime";
import * as React from 'react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Box, Text } from '../../ink.js';
import { useShortcutDisplay } from '../../keybindings/useShortcutDisplay.js';
import { SandboxManager } from '../../utils/sandbox/sandbox-adapter.js';
import { useI18n } from '../../hooks/useI18n.js';
export function SandboxPromptFooterHint() {
  const $ = _c(7);
  const [recentViolationCount, setRecentViolationCount] = useState(0);
  const timerRef = useRef(null);
  const detailsShortcut = useShortcutDisplay("app:toggleTranscript", "Global", "ctrl+o");
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
  let t2;
  if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = () => {
      if (!SandboxManager.isSandboxingEnabled()) {
        return;
      }
      const store = SandboxManager.getSandboxViolationStore();
      let lastCount = store.getTotalCount();
      const unsubscribe = store.subscribe(() => {
        const currentCount = store.getTotalCount();
        const newViolations = currentCount - lastCount;
        if (newViolations > 0) {
          setRecentViolationCount(newViolations);
          lastCount = currentCount;
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }
          timerRef.current = setTimeout(setRecentViolationCount, 5000, 0);
        }
      });
      return () => {
        unsubscribe();
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    };
    t2 = [];
    $[1] = t1;
    $[2] = t2;
  } else {
    t1 = $[1];
    t2 = $[2];
  }
  useEffect(t1, t2);
  if (!SandboxManager.isSandboxingEnabled() || recentViolationCount === 0) {
    return null;
  }
  const t3 = recentViolationCount === 1 ? t('promptInput.sandbox.operation') : t('promptInput.sandbox.operations');
  let t4;
  if ($[3] !== detailsShortcut || $[4] !== recentViolationCount || $[5] !== t3 || $[6] !== t) {
    t4 = <Box paddingX={0} paddingY={0}><Text color="inactive" wrap="truncate">⧈ {t('promptInput.sandbox.blocked', { count: recentViolationCount, operations: t3 })} · {detailsShortcut} {t('promptInput.sandbox.forDetails')} · {t('promptInput.sandbox.toDisable')}</Text></Box>;
    $[3] = detailsShortcut;
    $[4] = recentViolationCount;
    $[5] = t3;
    $[6] = t;
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  return t4;
}
