import { c as _c } from "react/compiler-runtime";
import figures from 'figures';
import * as React from 'react';
import { useState } from 'react';
import type { Root } from '../ink.js';
import { Box, Text, useAnimationFrame } from '../ink.js';
import { useI18n } from '../hooks/useI18n.js';
import { AppStateProvider } from '../state/AppState.js';
import { checkOutTeleportedSessionBranch, processMessagesForTeleportResume, type TeleportProgressStep, type TeleportResult, teleportResumeCodeSession } from '../utils/teleport.js';
type Props = {
  currentStep: TeleportProgressStep;
  sessionId?: string;
};
const SPINNER_FRAMES = ['◐', '◓', '◑', '◒'];
function getStepLabels(t: (key: string, params?: Record<string, unknown>) => string): { key: TeleportProgressStep; label: string }[] {
  return [{
    key: 'validating',
    label: t('teleport.progress.validating')
  }, {
    key: 'fetching_logs',
    label: t('teleport.progress.fetchingLogs')
  }, {
    key: 'fetching_branch',
    label: t('teleport.progress.fetchingBranch')
  }, {
    key: 'checking_out',
    label: t('teleport.progress.checkingOut')
  }];
}
export function TeleportProgress(t0) {
  const $ = _c(17);
  const {
    currentStep,
    sessionId
  } = t0;
  const { t, locale } = useI18n();
  const [ref, time] = useAnimationFrame(100);
  const frame = Math.floor(time / 100) % SPINNER_FRAMES.length;
  const STEPS = getStepLabels(t);
  let t1;
  if ($[0] !== currentStep) {
    t1 = s => s.key === currentStep;
    $[0] = currentStep;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const currentStepIndex = STEPS.findIndex(t1);
  const t2 = SPINNER_FRAMES[frame];
  let t3;
  if ($[2] !== locale || $[3] !== t2) {
    t3 = <Box marginBottom={1}><Text bold={true} color="claude">{t2} {t('teleport.progress.teleporting')}</Text></Box>;
    $[2] = locale;
    $[3] = t2;
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  let t4;
  if ($[5] !== sessionId) {
    t4 = sessionId && <Box marginBottom={1}><Text dimColor={true}>{sessionId}</Text></Box>;
    $[5] = sessionId;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  let t5;
  if ($[7] !== currentStepIndex || $[8] !== frame) {
    t5 = STEPS.map((step, index) => {
      const isComplete = index < currentStepIndex;
      const isCurrent = index === currentStepIndex;
      const isPending = index > currentStepIndex;
      let icon;
      let color;
      if (isComplete) {
        icon = figures.tick;
        color = "green";
      } else {
        if (isCurrent) {
          icon = SPINNER_FRAMES[frame];
          color = "claude";
        } else {
          icon = figures.circle;
          color = undefined;
        }
      }
      return <Box key={step.key} flexDirection="row"><Box width={2}><Text color={color as never} dimColor={isPending}>{icon}</Text></Box><Text dimColor={isPending} bold={isCurrent}>{step.label}</Text></Box>;
    });
    $[7] = currentStepIndex;
    $[8] = frame;
    $[9] = t5;
  } else {
    t5 = $[9];
  }
  let t6;
  if ($[10] !== t5) {
    t6 = <Box flexDirection="column" marginLeft={2}>{t5}</Box>;
    $[10] = t5;
    $[11] = t6;
  } else {
    t6 = $[11];
  }
  let t7;
  if ($[12] !== ref || $[13] !== t3 || $[14] !== t4 || $[15] !== t6) {
    t7 = <Box ref={ref} flexDirection="column" paddingX={1} paddingY={1}>{t3}{t4}{t6}</Box>;
    $[12] = ref;
    $[13] = t3;
    $[14] = t4;
    $[15] = t6;
    $[16] = t7;
  } else {
    t7 = $[16];
  }
  return t7;
}

/**
 * Teleports to a remote session with progress UI rendered into the existing root.
 * Fetches the session, checks out the branch, and returns the result.
 */
export async function teleportWithProgress(root: Root, sessionId: string): Promise<TeleportResult> {
  // Capture the setState function from the rendered component
  let setStep: (step: TeleportProgressStep) => void = () => {};
  function TeleportProgressWrapper(): React.ReactNode {
    const [step, _setStep] = useState<TeleportProgressStep>('validating');
    setStep = _setStep;
    return <TeleportProgress currentStep={step} sessionId={sessionId} />;
  }
  root.render(<AppStateProvider>
      <TeleportProgressWrapper />
    </AppStateProvider>);
  const result = await teleportResumeCodeSession(sessionId, setStep);
  setStep('checking_out');
  const {
    branchName,
    branchError
  } = await checkOutTeleportedSessionBranch(result.branch);
  return {
    messages: processMessagesForTeleportResume(result.log, branchError),
    branchName
  };
}
