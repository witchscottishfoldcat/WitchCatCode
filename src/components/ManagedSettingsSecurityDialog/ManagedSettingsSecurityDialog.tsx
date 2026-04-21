import { c as _c } from "react/compiler-runtime";
import React from 'react';
import { useI18n } from '../../hooks/useI18n.js';
import { useExitOnCtrlCDWithKeybindings } from '../../hooks/useExitOnCtrlCDWithKeybindings.js';
import { Box, Text } from '../../ink.js';
import { useKeybinding } from '../../keybindings/useKeybinding.js';
import type { SettingsJson } from '../../utils/settings/types.js';
import { Select } from '../CustomSelect/index.js';
import { PermissionDialog } from '../permissions/PermissionDialog.js';
import { extractDangerousSettings, formatDangerousSettingsList } from './utils.js';
type Props = {
  settings: SettingsJson;
  onAccept: () => void;
  onReject: () => void;
};
export function ManagedSettingsSecurityDialog(t0) {
  const $ = _c(32);
  const {
    settings,
    onAccept,
    onReject
  } = t0;
  const { t, locale } = useI18n();
  const dangerous = extractDangerousSettings(settings);
  const settingsList = formatDangerousSettingsList(dangerous);
  const exitState = useExitOnCtrlCDWithKeybindings();
  let t1;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = {
      context: "Confirmation"
    };
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  useKeybinding("confirm:no", onReject, t1);
  let t2;
  if ($[1] !== onAccept || $[2] !== onReject) {
    t2 = function onChange(value) {
      if (value === "exit") {
        onReject();
        return;
      }
      onAccept();
    };
    $[1] = onAccept;
    $[2] = onReject;
    $[3] = t2;
  } else {
    t2 = $[3];
  }
  const onChange = t2;
  const T0 = PermissionDialog;
  const t3 = "warning";
  const t4 = "warning";
  const t5 = "Managed settings require approval";
  const T1 = Box;
  const t6 = "column";
  const t7 = 1;
  const t8 = 1;
  let t9;
  if ($[4] !== locale) {
    t9 = <Text>{t('managedSettings.description')}</Text>;
    $[4] = locale;
    $[5] = t9;
  } else {
    t9 = $[5];
  }
  const T2 = Box;
  const t10 = "column";
  let t11;
  if ($[6] !== locale) {
    t11 = <Text dimColor={true}>{t('managedSettings.settingsRequiringApproval')}</Text>;
    $[6] = locale;
    $[7] = t11;
  } else {
    t11 = $[7];
  }
  const t12 = settingsList.map(_temp);
  let t13;
  if ($[8] !== T2 || $[9] !== t11 || $[10] !== t12) {
    t13 = <T2 flexDirection={t10}>{t11}{t12}</T2>;
    $[8] = T2;
    $[9] = t11;
    $[10] = t12;
    $[11] = t13;
  } else {
    t13 = $[11];
  }
  let t14;
  if ($[12] !== locale) {
    t14 = <Text>{t('managedSettings.trustWarning')}</Text>;
    $[12] = locale;
    $[13] = t14;
  } else {
    t14 = $[13];
  }
  let t15;
  if ($[14] !== locale) {
    t15 = [{
      label: t('managedSettings.trustSettings'),
      value: "accept"
    }, {
      label: t('managedSettings.exitClaudeCode'),
      value: "exit"
    }];
    $[14] = locale;
    $[15] = t15;
  } else {
    t15 = $[15];
  }
  let t16;
  if ($[16] !== onChange) {
    t16 = <Select options={t15} onChange={value_0 => onChange(value_0 as 'accept' | 'exit')} onCancel={() => onChange("exit")} />;
    $[16] = onChange;
    $[17] = t16;
  } else {
    t16 = $[17];
  }
  let t17;
  if ($[18] !== exitState.keyName || $[19] !== exitState.pending || $[20] !== locale) {
    t17 = <Text dimColor={true}>{exitState.pending ? <>{t('managedSettings.pressAgainToExit', { key: exitState.keyName })}</> : <>{t('managedSettings.enterToConfirm')}</>}</Text>;
    $[18] = exitState.keyName;
    $[19] = exitState.pending;
    $[20] = locale;
    $[21] = t17;
  } else {
    t17 = $[21];
  }
  let t18;
  if ($[22] !== T1 || $[23] !== t13 || $[24] !== t16 || $[25] !== t17 || $[26] !== t9) {
    t18 = <T1 flexDirection={t6} gap={t7} paddingTop={t8}>{t9}{t13}{t14}{t16}{t17}</T1>;
    $[22] = T1;
    $[23] = t13;
    $[24] = t16;
    $[25] = t17;
    $[26] = t9;
    $[27] = t18;
  } else {
    t18 = $[27];
  }
  let t19;
  if ($[28] !== T0 || $[29] !== locale || $[30] !== t18) {
    t19 = <T0 color={t3} titleColor={t4} title={t('managedSettings.title')}>{t18}</T0>;
    $[28] = T0;
    $[29] = locale;
    $[30] = t18;
    $[31] = t19;
  } else {
    t19 = $[31];
  }
  return t19;
}
function _temp(item, index) {
  return <Box key={index} paddingLeft={2}><Text><Text dimColor={true}>· </Text><Text>{item}</Text></Text></Box>;
}
