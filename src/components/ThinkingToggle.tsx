import { c as _c } from "react/compiler-runtime";
import * as React from 'react';
import { useState } from 'react';
import { useExitOnCtrlCDWithKeybindings } from 'src/hooks/useExitOnCtrlCDWithKeybindings.js';
import { Box, Text } from '../ink.js';
import { useKeybinding } from '../keybindings/useKeybinding.js';
import { ConfigurableShortcutHint } from './ConfigurableShortcutHint.js';
import { Select } from './CustomSelect/index.js';
import { Byline } from './design-system/Byline.js';
import { KeyboardShortcutHint } from './design-system/KeyboardShortcutHint.js';
import { Pane } from './design-system/Pane.js';
import { useI18n } from '../hooks/useI18n.js';
export type Props = {
  currentValue: boolean;
  onSelect: (enabled: boolean) => void;
  onCancel?: () => void;
  isMidConversation?: boolean;
};
export function ThinkingToggle(t0) {
  const $ = _c(31);
  const {
    currentValue,
    onSelect,
    onCancel,
    isMidConversation
  } = t0;
  const exitState = useExitOnCtrlCDWithKeybindings();
  const { t } = useI18n();
  const [confirmationPending, setConfirmationPending] = useState(null);
  let t1;
  if ($[0] !== t) {
    t1 = [{
      value: "true",
      label: t('thinkingToggle.enabled'),
      description: t('thinkingToggle.enabledDesc')
    }, {
      value: "false",
      label: t('thinkingToggle.disabled'),
      description: t('thinkingToggle.disabledDesc')
    }];
    $[0] = t;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const options = t1;
  let t2;
  if ($[2] !== confirmationPending || $[3] !== onCancel) {
    t2 = () => {
      if (confirmationPending !== null) {
        setConfirmationPending(null);
      } else {
        onCancel?.();
      }
    };
    $[2] = confirmationPending;
    $[3] = onCancel;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  let t3;
  if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
    t3 = {
      context: "Confirmation"
    };
    $[5] = t3;
  } else {
    t3 = $[5];
  }
  useKeybinding("confirm:no", t2, t3);
  let t4;
  if ($[6] !== confirmationPending || $[7] !== onSelect) {
    t4 = () => {
      if (confirmationPending !== null) {
        onSelect(confirmationPending);
      }
    };
    $[6] = confirmationPending;
    $[7] = onSelect;
    $[8] = t4;
  } else {
    t4 = $[8];
  }
  const t5 = confirmationPending !== null;
  let t6;
  if ($[9] !== t5) {
    t6 = {
      context: "Confirmation",
      isActive: t5
    };
    $[9] = t5;
    $[10] = t6;
  } else {
    t6 = $[10];
  }
  useKeybinding("confirm:yes", t4, t6);
  let t7;
  if ($[11] !== currentValue || $[12] !== isMidConversation || $[13] !== onSelect) {
    t7 = function handleSelectChange(value) {
      const selected = value === "true";
      if (isMidConversation && selected !== currentValue) {
        setConfirmationPending(selected);
      } else {
        onSelect(selected);
      }
    };
    $[11] = currentValue;
    $[12] = isMidConversation;
    $[13] = onSelect;
    $[14] = t7;
  } else {
    t7 = $[14];
  }
  const handleSelectChange = t7;
  let t8;
  if ($[15] !== t) {
    t8 = <Box marginBottom={1} flexDirection="column"><Text color="remember" bold={true}>{t('thinkingToggle.title')}</Text><Text dimColor={true}>{t('thinkingToggle.description')}</Text></Box>;
    $[15] = t;
    $[16] = t8;
  } else {
    t8 = $[16];
  }
  let t9;
  if ($[17] !== confirmationPending || $[18] !== currentValue || $[19] !== handleSelectChange || $[20] !== onCancel || $[21] !== t) {
    t9 = <Box flexDirection="column">{t8}{confirmationPending !== null ? <Box flexDirection="column" marginBottom={1} gap={1}><Text color="warning">{t('thinkingToggle.midConversationWarning')}</Text><Text color="warning">{t('thinkingToggle.confirmProceed')}</Text></Box> : <Box flexDirection="column" marginBottom={1}><Select defaultValue={currentValue ? "true" : "false"} defaultFocusValue={currentValue ? "true" : "false"} options={options} onChange={handleSelectChange} onCancel={onCancel ?? _temp} visibleOptionCount={2} /></Box>}</Box>;
    $[17] = confirmationPending;
    $[18] = currentValue;
    $[19] = handleSelectChange;
    $[20] = onCancel;
    $[21] = t;
    $[22] = t9;
  } else {
    t9 = $[22];
  }
  let t10;
  if ($[23] !== confirmationPending || $[24] !== exitState.keyName || $[25] !== exitState.pending || $[26] !== t) {
    t10 = <Text dimColor={true} italic={true}>{exitState.pending ? <>{t('thinkingToggle.pressAgainToExit', { key: exitState.keyName })}</> : confirmationPending !== null ? <Byline><KeyboardShortcutHint shortcut="Enter" action="confirm" /><ConfigurableShortcutHint action="confirm:no" context="Confirmation" fallback="Esc" description={t('thinkingToggle.cancel')} /></Byline> : <Byline><KeyboardShortcutHint shortcut="Enter" action="confirm" /><ConfigurableShortcutHint action="confirm:no" context="Confirmation" fallback="Esc" description={t('thinkingToggle.exit')} /></Byline>}</Text>;
    $[23] = confirmationPending;
    $[24] = exitState.keyName;
    $[25] = exitState.pending;
    $[26] = t;
    $[27] = t10;
  } else {
    t10 = $[27];
  }
  let t11;
  if ($[28] !== t10 || $[29] !== t9) {
    t11 = <Pane color="permission">{t9}{t10}</Pane>;
    $[28] = t10;
    $[29] = t9;
    $[30] = t11;
  } else {
    t11 = $[30];
  }
  return t11;
}
function _temp() {}
