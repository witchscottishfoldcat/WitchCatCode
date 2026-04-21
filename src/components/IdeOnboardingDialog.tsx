import { c as _c } from "react/compiler-runtime";
import React from 'react';
import { envDynamic } from 'src/utils/envDynamic.js';
import { Box, Text } from '../ink.js';
import { useKeybindings } from '../keybindings/useKeybinding.js';
import { getGlobalConfig, saveGlobalConfig } from '../utils/config.js';
import { env } from '../utils/env.js';
import { getTerminalIdeType, type IDEExtensionInstallationStatus, isJetBrainsIde, toIDEDisplayName } from '../utils/ide.js';
import { Dialog } from './design-system/Dialog.js';
import { useI18n } from '../hooks/useI18n.js';
interface Props {
  onDone: () => void;
  installationStatus: IDEExtensionInstallationStatus | null;
}
export function IdeOnboardingDialog(t0) {
  const $ = _c(23);
  const {
    onDone,
    installationStatus
  } = t0;
  markDialogAsShown();
  const { t } = useI18n();
  let t1;
  if ($[0] !== onDone) {
    t1 = {
      "confirm:yes": onDone,
      "confirm:no": onDone
    };
    $[0] = onDone;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  let t2;
  if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
    t2 = {
      context: "Confirmation"
    };
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  useKeybindings(t1, t2);
  let t3;
  if ($[3] !== installationStatus?.ideType) {
    t3 = installationStatus?.ideType ?? getTerminalIdeType();
    $[3] = installationStatus?.ideType;
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  const ideType = t3;
  const isJetBrains = isJetBrainsIde(ideType);
  let t4;
  if ($[5] !== ideType) {
    t4 = toIDEDisplayName(ideType);
    $[5] = ideType;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  const ideName = t4;
  const installedVersion = installationStatus?.installedVersion;
  const pluginOrExtension = isJetBrains ? t('ideOnboarding.plugin') : t('ideOnboarding.extension');
  const mentionShortcut = env.platform === "darwin" ? "Cmd+Option+K" : "Ctrl+Alt+K";
  let t5;
  if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
    t5 = <Text color="claude">✻ </Text>;
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  let t6;
  if ($[8] !== ideName) {
    t6 = <>{t5}<Text>{t('ideOnboarding.welcomeTitle', { ideName })}</Text></>;
    $[8] = ideName;
    $[9] = t6;
  } else {
    t6 = $[9];
  }
  const t7 = installedVersion ? t('ideOnboarding.installedVersion', { pluginOrExtension, version: installedVersion }) : undefined;
  let t8;
  if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
    t8 = <Text color="suggestion">⧉ </Text>;
    $[10] = t8;
  } else {
    t8 = $[10];
  }
  const openFilesLabel = <Text color="suggestion">{t8}{t('ideOnboarding.openFiles')}</Text>;
  const selectedLinesLabel = <Text color="suggestion">{t8}{t('ideOnboarding.selectedLines')}</Text>;
  const feature1 = <Text>• {t('ideOnboarding.feature1Prefix')}{openFilesLabel} {t('ideOnboarding.feature1And')}{selectedLinesLabel}</Text>;
  let t10;
  if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
    t10 = <Text color="diffAddedWord">+11</Text>;
    $[12] = t10;
  } else {
    t10 = $[12];
  }
  let t11;
  if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
    t11 = <Text color="diffRemovedWord">-22</Text>;
    $[13] = t11;
  } else {
    t11 = $[13];
  }
  const feature2 = <Text>• {t('ideOnboarding.feature2Prefix')}{t10} {t11} {t('ideOnboarding.feature2Suffix')}</Text>;
  const feature3 = <Text>• {mentionShortcut}<Text dimColor={true}> {t('ideOnboarding.quickLaunch')}</Text></Text>;
  const feature4 = <Text>• {mentionShortcut}<Text dimColor={true}> {t('ideOnboarding.referenceHint')}</Text></Text>;
  const featureList = <Box flexDirection="column" gap={1}>{feature1}{feature2}{feature3}{feature4}</Box>;
  let t14;
  if ($[16] !== onDone || $[17] !== t6 || $[18] !== t7) {
    t14 = <Dialog title={t6} subtitle={t7} color="ide" onCancel={onDone} hideInputGuide={true}>{featureList}</Dialog>;
    $[16] = onDone;
    $[17] = t6;
    $[18] = t7;
    $[19] = t14;
  } else {
    t14 = $[19];
  }
  const pressEnterHint = <Box paddingX={1}><Text dimColor={true} italic={true}>{t('ideOnboarding.pressEnter')}</Text></Box>;
  let t16;
  if ($[21] !== t14) {
    t16 = <>{t14}{pressEnterHint}</>;
    $[21] = t14;
    $[22] = t16;
  } else {
    t16 = $[22];
  }
  return t16;
}
export function hasIdeOnboardingDialogBeenShown(): boolean {
  const config = getGlobalConfig();
  const terminal = envDynamic.terminal || 'unknown';
  return config.hasIdeOnboardingBeenShown?.[terminal] === true;
}
function markDialogAsShown(): void {
  if (hasIdeOnboardingDialogBeenShown()) {
    return;
  }
  const terminal = envDynamic.terminal || 'unknown';
  saveGlobalConfig(current => ({
    ...current,
    hasIdeOnboardingBeenShown: {
      ...current.hasIdeOnboardingBeenShown,
      [terminal]: true
    }
  }));
}
