import { c as _c } from "react/compiler-runtime";
import React, { useEffect, useState } from 'react';
import type { CommandResultDisplay } from '../commands.js';
// eslint-disable-next-line custom-rules/prefer-use-keybindings -- raw input for "any key" dismiss and y/n prompt
import { Box, Text, useInput } from '../ink.js';
import { useI18n } from '../hooks/useI18n.js';
import { t as translate } from '../i18n/core.js';
import { openBrowser } from '../utils/browser.js';
import { getDesktopInstallStatus, openCurrentSessionInDesktop } from '../utils/desktopDeepLink.js';
import { errorMessage } from '../utils/errors.js';
import { gracefulShutdown } from '../utils/gracefulShutdown.js';
import { flushSessionStorage } from '../utils/sessionStorage.js';
import { LoadingState } from './design-system/LoadingState.js';
const DESKTOP_DOCS_URL = 'https://clau.de/desktop';
export function getDownloadUrl(): string {
  switch (process.platform) {
    case 'win32':
      return 'https://claude.ai/api/desktop/win32/x64/exe/latest/redirect';
    default:
      return 'https://claude.ai/api/desktop/darwin/universal/dmg/latest/redirect';
  }
}
type DesktopHandoffState = 'checking' | 'prompt-download' | 'flushing' | 'opening' | 'success' | 'error';
type Props = {
  onDone: (result?: string, options?: {
    display?: CommandResultDisplay;
  }) => void;
};
export function DesktopHandoff(t0) {
  const $ = _c(28);
  const {
    onDone
  } = t0;
  const { t, locale } = useI18n();
  const [state, setState] = useState("checking");
  const [error, setError] = useState(null);
  const [downloadMessage, setDownloadMessage] = useState("");
  let t1;
  if ($[0] !== error || $[1] !== locale || $[2] !== onDone || $[3] !== state) {
    t1 = input => {
      if (state === "error") {
        onDone(error ?? "Unknown error", {
          display: "system"
        });
        return;
      }
      if (state === "prompt-download") {
        if (input === "y" || input === "Y") {
          openBrowser(getDownloadUrl()).catch(_temp);
          onDone(`${t('desktopHandoff.startingDownload')}\n${t('desktopHandoff.learnMore', { url: DESKTOP_DOCS_URL })}`, {
            display: "system"
          });
        } else {
          if (input === "n" || input === "N") {
            onDone(t('desktopHandoff.desktopRequired', { url: DESKTOP_DOCS_URL }), {
              display: "system"
            });
          }
        }
      }
    };
    $[0] = error;
    $[1] = locale;
    $[2] = onDone;
    $[3] = state;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  useInput(t1);
  let t2;
  let t3;
  if ($[5] !== locale || $[6] !== onDone) {
    t2 = () => {
      const performHandoff = async function performHandoff() {
        setState("checking");
        const installStatus = await getDesktopInstallStatus();
        if (installStatus.status === "not-installed") {
          setDownloadMessage(t('desktopHandoff.notInstalled'));
          setState("prompt-download");
          return;
        }
        if (installStatus.status === "version-too-old") {
          setDownloadMessage(t('desktopHandoff.versionTooOld', { version: installStatus.version }));
          setState("prompt-download");
          return;
        }
        setState("flushing");
        await flushSessionStorage();
        setState("opening");
        const result = await openCurrentSessionInDesktop();
        if (!result.success) {
          setError(result.error ?? t('desktopHandoff.failedToOpen'));
          setState("error");
          return;
        }
        setState("success");
        setTimeout(_temp2, 500, onDone);
      };
      performHandoff().catch(err => {
        setError(errorMessage(err));
        setState("error");
      });
    };
    t3 = [onDone];
    $[5] = locale;
    $[6] = onDone;
    $[7] = t2;
    $[8] = t3;
  } else {
    t2 = $[7];
    t3 = $[8];
  }
  useEffect(t2, t3);
  if (state === "error") {
    let t4;
    if ($[9] !== error || $[10] !== locale) {
      t4 = <Text color="error">{t('desktopHandoff.errorPrefix')}{error}</Text>;
      $[9] = error;
      $[10] = locale;
      $[11] = t4;
    } else {
      t4 = $[11];
    }
    let t5;
    if ($[12] !== locale) {
      t5 = <Text dimColor={true}>{t('desktopHandoff.pressAnyKey')}</Text>;
      $[12] = locale;
      $[13] = t5;
    } else {
      t5 = $[13];
    }
    let t6;
    if ($[14] !== t4 || $[15] !== t5) {
      t6 = <Box flexDirection="column" paddingX={2}>{t4}{t5}</Box>;
      $[14] = t4;
      $[15] = t5;
      $[16] = t6;
    } else {
      t6 = $[16];
    }
    return t6;
  }
  if (state === "prompt-download") {
    let t4;
    if ($[17] !== downloadMessage) {
      t4 = <Text>{downloadMessage}</Text>;
      $[17] = downloadMessage;
      $[18] = t4;
    } else {
      t4 = $[18];
    }
    let t5;
    if ($[19] !== locale) {
      t5 = <Text>{t('desktopHandoff.downloadNow')}</Text>;
      $[19] = locale;
      $[20] = t5;
    } else {
      t5 = $[20];
    }
    let t6;
    if ($[21] !== t4 || $[22] !== t5) {
      t6 = <Box flexDirection="column" paddingX={2}>{t4}{t5}</Box>;
      $[21] = t4;
      $[22] = t5;
      $[23] = t6;
    } else {
      t6 = $[23];
    }
    return t6;
  }
  let t4;
  if ($[24] !== locale) {
    t4 = {
      checking: t('desktopHandoff.checking'),
      flushing: t('desktopHandoff.saving'),
      opening: t('desktopHandoff.opening'),
      success: t('desktopHandoff.openingInDesktop')
    };
    $[24] = locale;
    $[25] = t4;
  } else {
    t4 = $[25];
  }
  const messages = t4;
  const t5 = messages[state];
  let t6;
  if ($[26] !== t5) {
    t6 = <LoadingState message={t5} />;
    $[26] = t5;
    $[27] = t6;
  } else {
    t6 = $[27];
  }
  return t6;
}
async function _temp2(onDone_0) {
  onDone_0(translate('desktopHandoff.sessionTransferred'), {
    display: "system"
  });
  await gracefulShutdown(0, "other");
}
function _temp() {}
