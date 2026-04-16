import { c as _c } from "react/compiler-runtime";
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { getAllOutputStyles, OUTPUT_STYLE_CONFIG, type OutputStyleConfig } from '../constants/outputStyles.js';
import { Box, Text } from '../ink.js';
import type { OutputStyle } from '../utils/config.js';
import { getCwd } from '../utils/cwd.js';
import type { OptionWithDescription } from './CustomSelect/select.js';
import { Select } from './CustomSelect/select.js';
import { Dialog } from './design-system/Dialog.js';
import { useI18n } from '../hooks/useI18n.js';
function mapConfigsToOptions(styles: {
  [styleName: string]: OutputStyleConfig | null;
}, t: (key: string, params?: Record<string, string>) => string): OptionWithDescription[] {
  return Object.entries(styles).map(([style, config]) => ({
    label: config?.name ?? t('outputStyle.defaultLabel'),
    value: style,
    description: config?.description ?? t('outputStyle.defaultDescription')
  }));
}
export type OutputStylePickerProps = {
  initialStyle: OutputStyle;
  onComplete: (style: OutputStyle) => void;
  onCancel: () => void;
  isStandaloneCommand?: boolean;
};
export function OutputStylePicker(t0) {
  const $ = _c(16);
  const {
    initialStyle,
    onComplete,
    onCancel,
    isStandaloneCommand
  } = t0;
  const { t } = useI18n();
  let t1;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = [];
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const [styleOptions, setStyleOptions] = useState(t1);
  const [isLoading, setIsLoading] = useState(true);
  let t2;
  let t3;
  if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
    t2 = () => {
      getAllOutputStyles(getCwd()).then(allStyles => {
        const options = mapConfigsToOptions(allStyles, t);
        setStyleOptions(options);
        setIsLoading(false);
      }).catch(() => {
        const builtInOptions = mapConfigsToOptions(OUTPUT_STYLE_CONFIG, t);
        setStyleOptions(builtInOptions);
        setIsLoading(false);
      });
    };
    t3 = [];
    $[1] = t2;
    $[2] = t3;
  } else {
    t2 = $[1];
    t3 = $[2];
  }
  useEffect(t2, t3);
  let t4;
  if ($[3] !== onComplete) {
    t4 = style => {
      const outputStyle = style as OutputStyle;
      onComplete(outputStyle);
    };
    $[3] = onComplete;
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  const handleStyleSelect = t4;
  const hideInputGuide = !isStandaloneCommand;
  const hideBorder = !isStandaloneCommand;
  const hintElement = <Box marginTop={1}><Text dimColor={true}>{t('outputStyle.hint')}</Text></Box>;
  let t8;
  if ($[6] !== handleStyleSelect || $[7] !== initialStyle || $[8] !== isLoading || $[9] !== styleOptions) {
    t8 = <Box flexDirection="column" gap={1}>{hintElement}{isLoading ? <Text dimColor={true}>{t('outputStyle.loading')}</Text> : <Select options={styleOptions} onChange={handleStyleSelect} visibleOptionCount={10} defaultValue={initialStyle} />}</Box>;
    $[6] = handleStyleSelect;
    $[7] = initialStyle;
    $[8] = isLoading;
    $[9] = styleOptions;
    $[10] = t8;
  } else {
    t8 = $[10];
  }
  let t9;
  if ($[11] !== onCancel || $[12] !== hideInputGuide || $[13] !== hideBorder || $[14] !== t8) {
    t9 = <Dialog title={t('outputStyle.title')} onCancel={onCancel} hideInputGuide={hideInputGuide} hideBorder={hideBorder}>{t8}</Dialog>;
    $[11] = onCancel;
    $[12] = hideInputGuide;
    $[13] = hideBorder;
    $[14] = t8;
    $[15] = t9;
  } else {
    t9 = $[15];
  }
  return t9;
}
