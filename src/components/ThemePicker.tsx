import { c as _c } from "react/compiler-runtime";
import { feature } from 'bun:bundle';
import * as React from 'react';
import { useExitOnCtrlCDWithKeybindings } from '../hooks/useExitOnCtrlCDWithKeybindings.js';
import { useTerminalSize } from '../hooks/useTerminalSize.js';
import { Box, Text, usePreviewTheme, useTheme, useThemeSetting } from '../ink.js';
import { useRegisterKeybindingContext } from '../keybindings/KeybindingContext.js';
import { useKeybinding } from '../keybindings/useKeybinding.js';
import { useShortcutDisplay } from '../keybindings/useShortcutDisplay.js';
import { useAppState, useSetAppState } from '../state/AppState.js';
import { gracefulShutdown } from '../utils/gracefulShutdown.js';
import { updateSettingsForSource } from '../utils/settings/settings.js';
import type { ThemeSetting } from '../utils/theme.js';
import { Select } from './CustomSelect/index.js';
import { Byline } from './design-system/Byline.js';
import { KeyboardShortcutHint } from './design-system/KeyboardShortcutHint.js';
import { getColorModuleUnavailableReason, getSyntaxTheme } from './StructuredDiff/colorDiff.js';
import { StructuredDiff } from './StructuredDiff.js';
import { useI18n } from '../hooks/useI18n.js';
export type ThemePickerProps = {
  onThemeSelect: (setting: ThemeSetting) => void;
  showIntroText?: boolean;
  helpText?: string;
  showHelpTextBelow?: boolean;
  hideEscToCancel?: boolean;
  /** Skip exit handling when running in a context that already has it (e.g., onboarding) */
  skipExitHandling?: boolean;
  /** Called when the user cancels (presses Escape). If skipExitHandling is true and this is provided, it will be called instead of just saving the preview. */
  onCancel?: () => void;
};
export function ThemePicker(t0) {
  const $ = _c(63);
  const {
    onThemeSelect,
    showIntroText: t1,
    helpText: t2,
    showHelpTextBelow: t3,
    hideEscToCancel: t4,
    skipExitHandling: t5,
    onCancel: onCancelProp
  } = t0;
  const showIntroText = t1 === undefined ? false : t1;
  const helpText = t2 === undefined ? "" : t2;
  const showHelpTextBelow = t3 === undefined ? false : t3;
  const hideEscToCancel = t4 === undefined ? false : t4;
  const skipExitHandling = t5 === undefined ? false : t5;
  const [theme] = useTheme();
  const themeSetting = useThemeSetting();
  const {
    columns
  } = useTerminalSize();
  let t6;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t6 = getColorModuleUnavailableReason();
    $[0] = t6;
  } else {
    t6 = $[0];
  }
  const colorModuleUnavailableReason = t6;
  let t7;
  if ($[1] !== theme) {
    t7 = colorModuleUnavailableReason === null ? getSyntaxTheme(theme) : null;
    $[1] = theme;
    $[2] = t7;
  } else {
    t7 = $[2];
  }
  const syntaxTheme = t7;
  const {
    setPreviewTheme,
    savePreview,
    cancelPreview
  } = usePreviewTheme();
  const syntaxHighlightingDisabled = useAppState(_temp) ?? false;
  const setAppState = useSetAppState();
  useRegisterKeybindingContext("ThemePicker");
  const syntaxToggleShortcut = useShortcutDisplay("theme:toggleSyntaxHighlighting", "ThemePicker", "ctrl+t");
  const { t } = useI18n();
  let t8;
  if ($[3] !== setAppState || $[4] !== syntaxHighlightingDisabled) {
    t8 = () => {
      if (colorModuleUnavailableReason === null) {
        const newValue = !syntaxHighlightingDisabled;
        updateSettingsForSource("userSettings", {
          syntaxHighlightingDisabled: newValue
        });
        setAppState(prev => ({
          ...prev,
          settings: {
            ...prev.settings,
            syntaxHighlightingDisabled: newValue
          }
        }));
      }
    };
    $[3] = setAppState;
    $[4] = syntaxHighlightingDisabled;
    $[5] = t8;
  } else {
    t8 = $[5];
  }
  let t9;
  if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
    t9 = {
      context: "ThemePicker"
    };
    $[6] = t9;
  } else {
    t9 = $[6];
  }
  useKeybinding("theme:toggleSyntaxHighlighting", t8, t9);
  const exitState = useExitOnCtrlCDWithKeybindings(skipExitHandling ? _temp2 : undefined);
  let t10;
  if ($[7] !== t) {
    t10 = [...(feature("AUTO_THEME") ? [{
      label: t('config.theme.auto'),
      value: "auto" as const
    }] : []), {
      label: t('config.theme.dark'),
      value: "dark"
    }, {
      label: t('config.theme.light'),
      value: "light"
    }, {
      label: t('config.theme.darkDaltonized'),
      value: "dark-daltonized"
    }, {
      label: t('config.theme.lightDaltonized'),
      value: "light-daltonized"
    }, {
      label: t('config.theme.darkAnsi'),
      value: "dark-ansi"
    }, {
      label: t('config.theme.lightAnsi'),
      value: "light-ansi"
    }];
    $[7] = t;
    $[8] = t10;
  } else {
    t10 = $[8];
  }
  const themeOptions = t10;
  let t11;
  if ($[9] !== showIntroText || $[10] !== t) {
    t11 = showIntroText ? <Text>{t('themePicker.letsGetStarted')}</Text> : <Text bold={true} color="permission">{t('themePicker.theme')}</Text>;
    $[9] = showIntroText;
    $[10] = t;
    $[11] = t11;
  } else {
    t11 = $[11];
  }
  let t12;
  if ($[12] !== t) {
    t12 = <Text bold={true}>{t('themePicker.chooseStyle')}</Text>;
    $[12] = t;
    $[13] = t12;
  } else {
    t12 = $[13];
  }
  let t13;
  if ($[14] !== helpText || $[15] !== showHelpTextBelow) {
    t13 = helpText && !showHelpTextBelow && <Text dimColor={true}>{helpText}</Text>;
    $[14] = helpText;
    $[15] = showHelpTextBelow;
    $[16] = t13;
  } else {
    t13 = $[16];
  }
  let t14;
  if ($[17] !== t13) {
    t14 = <Box flexDirection="column">{t12}{t13}</Box>;
    $[17] = t13;
    $[18] = t14;
  } else {
    t14 = $[18];
  }
  let t15;
  if ($[19] !== setPreviewTheme) {
    t15 = setting => {
      setPreviewTheme(setting as ThemeSetting);
    };
    $[19] = setPreviewTheme;
    $[20] = t15;
  } else {
    t15 = $[20];
  }
  let t16;
  if ($[21] !== onThemeSelect || $[22] !== savePreview) {
    t16 = setting_0 => {
      savePreview();
      onThemeSelect(setting_0 as ThemeSetting);
    };
    $[21] = onThemeSelect;
    $[22] = savePreview;
    $[23] = t16;
  } else {
    t16 = $[23];
  }
  let t17;
  if ($[24] !== cancelPreview || $[25] !== onCancelProp || $[26] !== skipExitHandling) {
    t17 = skipExitHandling ? () => {
      cancelPreview();
      onCancelProp?.();
    } : async () => {
      cancelPreview();
      await gracefulShutdown(0);
    };
    $[24] = cancelPreview;
    $[25] = onCancelProp;
    $[26] = skipExitHandling;
    $[27] = t17;
  } else {
    t17 = $[27];
  }
  let t18;
  if ($[28] !== t15 || $[29] !== t16 || $[30] !== t17 || $[31] !== themeSetting) {
    t18 = <Select options={themeOptions} onFocus={t15} onChange={t16} onCancel={t17} visibleOptionCount={themeOptions.length} defaultValue={themeSetting} defaultFocusValue={themeSetting} />;
    $[28] = t15;
    $[29] = t16;
    $[30] = t17;
    $[31] = themeSetting;
    $[32] = t18;
  } else {
    t18 = $[32];
  }
  let t19;
  if ($[33] !== t11 || $[34] !== t14 || $[35] !== t18) {
    t19 = <Box flexDirection="column" gap={1}>{t11}{t14}{t18}</Box>;
    $[33] = t11;
    $[34] = t14;
    $[35] = t18;
    $[36] = t19;
  } else {
    t19 = $[36];
  }
  let t20;
  if ($[37] === Symbol.for("react.memo_cache_sentinel")) {
    t20 = {
      oldStart: 1,
      newStart: 1,
      oldLines: 3,
      newLines: 3,
      lines: [" function greet() {", "-  console.log(\"Hello, World!\");", "+  console.log(\"Hello, Claude!\");", " }"]
    };
    $[37] = t20;
  } else {
    t20 = $[37];
  }
  let t21;
  if ($[38] !== columns) {
    t21 = <Box flexDirection="column" borderTop={true} borderBottom={true} borderLeft={false} borderRight={false} borderStyle="dashed" borderColor="subtle"><StructuredDiff patch={t20} dim={false} filePath="demo.js" firstLine={null} width={columns} /></Box>;
    $[38] = columns;
    $[39] = t21;
  } else {
    t21 = $[39];
  }
  const t22 = colorModuleUnavailableReason === "env" ? t('themePicker.syntaxDisabledEnv', { value: process.env.CLAUDE_CODE_SYNTAX_HIGHLIGHT }) : syntaxHighlightingDisabled ? t('themePicker.syntaxDisabled', { shortcut: syntaxToggleShortcut }) : syntaxTheme ? t('themePicker.syntaxTheme', { theme: syntaxTheme.theme, source: syntaxTheme.source ? t('themePicker.syntaxFrom', { source: syntaxTheme.source }) : '', shortcut: syntaxToggleShortcut }) : t('themePicker.syntaxEnabled', { shortcut: syntaxToggleShortcut });
  let t23;
  if ($[40] !== t22) {
    t23 = <Text dimColor={true}>{" "}{t22}</Text>;
    $[40] = t22;
    $[41] = t23;
  } else {
    t23 = $[41];
  }
  let t24;
  if ($[42] !== t21 || $[43] !== t23) {
    t24 = <Box flexDirection="column" width="100%">{t21}{t23}</Box>;
    $[42] = t21;
    $[43] = t23;
    $[44] = t24;
  } else {
    t24 = $[44];
  }
  let t25;
  if ($[45] !== t19 || $[46] !== t24) {
    t25 = <Box flexDirection="column" gap={1}>{t19}{t24}</Box>;
    $[45] = t19;
    $[46] = t24;
    $[47] = t25;
  } else {
    t25 = $[47];
  }
  const content = t25;
  if (!showIntroText) {
    let t26;
    if ($[48] !== content) {
      t26 = <Box flexDirection="column">{content}</Box>;
      $[48] = content;
      $[49] = t26;
    } else {
      t26 = $[49];
    }
    let t27;
    if ($[50] !== helpText || $[51] !== showHelpTextBelow) {
      t27 = showHelpTextBelow && helpText && <Box marginLeft={3}><Text dimColor={true}>{helpText}</Text></Box>;
      $[50] = helpText;
      $[51] = showHelpTextBelow;
      $[52] = t27;
    } else {
      t27 = $[52];
    }
    let t28;
    if ($[53] !== exitState || $[54] !== hideEscToCancel || $[55] !== t) {
      t28 = !hideEscToCancel && <Box><Text dimColor={true} italic={true}>{exitState.pending ? <>{t('themePicker.pressAgainToExit', { key: exitState.keyName })}</> : <Byline><KeyboardShortcutHint shortcut="Enter" action="select" /><KeyboardShortcutHint shortcut="Esc" action="cancel" /></Byline>}</Text></Box>;
      $[53] = exitState;
      $[54] = hideEscToCancel;
      $[55] = t;
      $[56] = t28;
    } else {
      t28 = $[56];
    }
    let t29;
    if ($[57] !== t27 || $[58] !== t28) {
      t29 = <Box marginTop={1}>{t27}{t28}</Box>;
      $[57] = t27;
      $[58] = t28;
      $[59] = t29;
    } else {
      t29 = $[59];
    }
    let t30;
    if ($[60] !== t26 || $[61] !== t29) {
      t30 = <>{t26}{t29}</>;
      $[60] = t26;
      $[61] = t29;
      $[62] = t30;
    } else {
      t30 = $[62];
    }
    return t30;
  }
  return content;
}
function _temp2() {}
function _temp(s) {
  return s.settings.syntaxHighlightingDisabled;
}
