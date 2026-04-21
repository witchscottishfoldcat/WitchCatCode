import { c as _c } from "react/compiler-runtime";
import React from 'react';
import { Text } from '../ink.js';
import { useI18n } from '../hooks/useI18n.js';
import { saveGlobalConfig } from '../utils/config.js';
import { Select } from './CustomSelect/index.js';
import { Dialog } from './design-system/Dialog.js';
type Props = {
  customApiKeyTruncated: string;
  onDone(approved: boolean): void;
};
export function ApproveApiKey(t0) {
  const $ = _c(22);
  const {
    customApiKeyTruncated,
    onDone
  } = t0;
  const { t, locale } = useI18n();
  let t1;
  if ($[0] !== customApiKeyTruncated || $[1] !== onDone) {
    t1 = function onChange(value) {
      bb2: switch (value) {
        case "yes":
          {
            saveGlobalConfig(current_0 => ({
              ...current_0,
              customApiKeyResponses: {
                ...current_0.customApiKeyResponses,
                approved: [...(current_0.customApiKeyResponses?.approved ?? []), customApiKeyTruncated]
              }
            }));
            onDone(true);
            break bb2;
          }
        case "no":
          {
            saveGlobalConfig(current => ({
              ...current,
              customApiKeyResponses: {
                ...current.customApiKeyResponses,
                rejected: [...(current.customApiKeyResponses?.rejected ?? []), customApiKeyTruncated]
              }
            }));
            onDone(false);
          }
      }
    };
    $[0] = customApiKeyTruncated;
    $[1] = onDone;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  const onChange = t1;
  let t2;
  if ($[3] !== onChange) {
    t2 = () => onChange("no");
    $[3] = onChange;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  let t3;
  if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
    t3 = <Text bold={true}>WITCHCAT_API_KEY</Text>;
    $[5] = t3;
  } else {
    t3 = $[5];
  }
  let t4;
  if ($[6] !== customApiKeyTruncated) {
    t4 = <Text>{t3}<Text>{t('approveApiKey.keySuffix', { key: customApiKeyTruncated })}</Text></Text>;
    $[6] = customApiKeyTruncated;
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  let t5;
  if ($[8] !== locale) {
    t5 = <Text>{t('approveApiKey.confirmUse')}</Text>;
    $[8] = locale;
    $[9] = t5;
  } else {
    t5 = $[9];
  }
  let t6;
  if ($[10] !== locale) {
    t6 = {
      label: t('common.yes'),
      value: "yes"
    };
    $[10] = locale;
    $[11] = t6;
  } else {
    t6 = $[11];
  }
  let t7;
  if ($[12] !== locale || $[13] !== t6) {
    t7 = [t6, {
      label: <Text>{t('approveApiKey.no')} (<Text bold={true}>{t('approveApiKey.recommended')}</Text>)</Text>,
      value: "no"
    }];
    $[12] = locale;
    $[13] = t6;
    $[14] = t7;
  } else {
    t7 = $[14];
  }
  let t8;
  if ($[15] !== onChange) {
    t8 = <Select defaultValue="no" defaultFocusValue="no" options={t7} onChange={value_0 => onChange(value_0 as 'yes' | 'no')} onCancel={() => onChange("no")} />;
    $[15] = onChange;
    $[16] = t8;
  } else {
    t8 = $[16];
  }
  let t9;
  if ($[17] !== locale || $[18] !== t2 || $[19] !== t4 || $[20] !== t8) {
    t9 = <Dialog title={t('approveApiKey.title')} color="warning" onCancel={t2}>{t4}{t5}{t8}</Dialog>;
    $[17] = locale;
    $[18] = t2;
    $[19] = t4;
    $[20] = t8;
    $[21] = t9;
  } else {
    t9 = $[21];
  }
  return t9;
}
