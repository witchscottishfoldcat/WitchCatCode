import { c as _c } from "react/compiler-runtime";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { type AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS, logEvent } from 'src/services/analytics/index.js';
import { setupTerminal, shouldOfferTerminalSetup } from '../commands/terminalSetup/terminalSetup.js';
import { useExitOnCtrlCDWithKeybindings } from '../hooks/useExitOnCtrlCDWithKeybindings.js';
import { useI18n } from '../hooks/useI18n.js';
import { Box, Link, Newline, Text, useTheme } from '../ink.js';
import { useKeybindings } from '../keybindings/useKeybinding.js';
import { isAnthropicAuthEnabled } from '../utils/auth.js';
import { normalizeApiKeyForConfig } from '../utils/authPortable.js';
import { getCustomApiKeyStatus } from '../utils/config.js';
import { env } from '../utils/env.js';
import { isRunningOnHomespace } from '../utils/envUtils.js';
import { PreflightStep } from '../utils/preflightChecks.js';
import type { ThemeSetting } from '../utils/theme.js';
import { ApproveApiKey } from './ApproveApiKey.js';
import { ConsoleOAuthFlow } from './ConsoleOAuthFlow.js';
import { Select } from './CustomSelect/select.js';
import { WelcomeV2 } from './LogoV2/WelcomeV2.js';
import { PressEnterToContinue } from './PressEnterToContinue.js';
import { ThemePicker } from './ThemePicker.js';
import { OrderedList } from './ui/OrderedList.js';
type StepId = 'preflight' | 'theme' | 'oauth' | 'api-key' | 'security' | 'terminal-setup';
interface OnboardingStep {
  id: StepId;
  component: React.ReactNode;
}
type Props = {
  onDone(): void;
};
export function Onboarding({
  onDone
}: Props): React.ReactNode {
  const { t } = useI18n();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [skipOAuth, setSkipOAuth] = useState(false);
  const [oauthEnabled] = useState(() => isAnthropicAuthEnabled());
  const [theme, setTheme] = useTheme();
  useEffect(() => {
    logEvent('tengu_began_setup', {
      oauthEnabled
    });
  }, [oauthEnabled]);
  function goToNextStep() {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      logEvent('tengu_onboarding_step', {
        oauthEnabled,
        stepId: steps[nextIndex]?.id as AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS
      });
    } else {
      onDone();
    }
  }
  function handleThemeSelection(newTheme: ThemeSetting) {
    setTheme(newTheme);
    goToNextStep();
  }
  const exitState = useExitOnCtrlCDWithKeybindings();

  // Define all onboarding steps
  const themeStep = <Box marginX={1}>
      <ThemePicker onThemeSelect={handleThemeSelection} showIntroText={true} helpText={t('onboarding.themeChangeHint')} hideEscToCancel={true} skipExitHandling={true} // Skip exit handling as Onboarding already handles it
    />
    </Box>;
  const securityStep = <Box flexDirection="column" gap={1} paddingLeft={1}>
      <Text bold>{t('onboarding.securityNotes')}</Text>
      <Box flexDirection="column" width={70}>
        {/**
         * OrderedList misnumbers items when rendering conditionally,
         * so put all items in the if/else
         */}
        <OrderedList>
          <OrderedList.Item>
            <Text>{t('onboarding.claudeCanMakeMistakes')}</Text>
            <Text dimColor wrap="wrap">
              {t('onboarding.reviewResponses')}
              <Newline />
              {t('onboarding.runningCode')}
              <Newline />
            </Text>
          </OrderedList.Item>
          <OrderedList.Item>
            <Text>
              {t('onboarding.promptInjectionRisk')}
            </Text>
            <Text dimColor wrap="wrap">
              {t('onboarding.moreDetails')}
              <Newline />
              <Link url="https://code.claude.com/docs/en/security" />
            </Text>
          </OrderedList.Item>
        </OrderedList>
      </Box>
      <PressEnterToContinue />
    </Box>;
  const preflightStep = <PreflightStep onSuccess={goToNextStep} />;
  // Create the steps array - determine which steps to include based on reAuth and oauthEnabled
  const apiKeyNeedingApproval = useMemo(() => {
    // Add API key step if needed
    // On homespace, WITCHCAT_API_KEY is preserved in process.env for child
    // processes but ignored by Claude Code itself (see auth.ts).
    if (!process.env.WITCHCAT_API_KEY || isRunningOnHomespace()) {
      return '';
    }
    const customApiKeyTruncated = normalizeApiKeyForConfig(process.env.WITCHCAT_API_KEY);
    if (getCustomApiKeyStatus(customApiKeyTruncated) === 'new') {
      return customApiKeyTruncated;
    }
  }, []);
  function handleApiKeyDone(approved: boolean) {
    if (approved) {
      setSkipOAuth(true);
    }
    goToNextStep();
  }
  const steps: OnboardingStep[] = [];
  if (oauthEnabled) {
    steps.push({
      id: 'preflight',
      component: preflightStep
    });
  }
  steps.push({
    id: 'theme',
    component: themeStep
  });
  if (apiKeyNeedingApproval) {
    steps.push({
      id: 'api-key',
      component: <ApproveApiKey customApiKeyTruncated={apiKeyNeedingApproval} onDone={handleApiKeyDone} />
    });
  }
  if (oauthEnabled) {
    steps.push({
      id: 'oauth',
      component: <SkippableStep skip={skipOAuth} onSkip={goToNextStep}>
          <ConsoleOAuthFlow onDone={goToNextStep} />
        </SkippableStep>
    });
  }
  steps.push({
    id: 'security',
    component: securityStep
  });
  if (shouldOfferTerminalSetup()) {
    steps.push({
      id: 'terminal-setup',
      component: <Box flexDirection="column" gap={1} paddingLeft={1}>
          <Text bold>{t('onboarding.terminalSetupTitle')}</Text>
          <Box flexDirection="column" width={70} gap={1}>
            <Text>
              {t('onboarding.terminalSetupDesc')}
              <Newline />
              {env.terminal === 'Apple_Terminal' ? t('onboarding.optionEnterForNewlines') : t('onboarding.shiftEnterForNewlines')}
            </Text>
            <Select options={[{
            label: t('onboarding.yesRecommended'),
            value: 'install'
          }, {
            label: t('onboarding.noMaybeLater'),
            value: 'no'
          }]} onChange={value => {
            if (value === 'install') {
              // Errors already logged in setupTerminal, just swallow and proceed
              void setupTerminal(theme).catch(() => {}).finally(goToNextStep);
            } else {
              goToNextStep();
            }
          }} onCancel={() => goToNextStep()} />
            <Text dimColor>
              {exitState.pending ? <>{t('onboarding.pressToExit', { key: exitState.keyName })}</> : <>{t('onboarding.enterToConfirmEscToSkip')}</>}
            </Text>
          </Box>
        </Box>
    });
  }
  const currentStep = steps[currentStepIndex];

  // Handle Enter on security step and Escape on terminal-setup step
  // Dependencies match what goToNextStep uses internally
  const handleSecurityContinue = useCallback(() => {
    if (currentStepIndex === steps.length - 1) {
      onDone();
    } else {
      goToNextStep();
    }
  }, [currentStepIndex, steps.length, oauthEnabled, onDone]);
  const handleTerminalSetupSkip = useCallback(() => {
    goToNextStep();
  }, [currentStepIndex, steps.length, oauthEnabled, onDone]);
  useKeybindings({
    'confirm:yes': handleSecurityContinue
  }, {
    context: 'Confirmation',
    isActive: currentStep?.id === 'security'
  });
  useKeybindings({
    'confirm:no': handleTerminalSetupSkip
  }, {
    context: 'Confirmation',
    isActive: currentStep?.id === 'terminal-setup'
  });
  return <Box flexDirection="column">
      <WelcomeV2 />
      <Box flexDirection="column" marginTop={1}>
        {currentStep?.component}
        {exitState.pending && <Box padding={1}>
            <Text dimColor>{t('onboarding.pressToExit', { key: exitState.keyName })}</Text>
          </Box>}
      </Box>
    </Box>;
}
export function SkippableStep(t0) {
  const $ = _c(4);
  const {
    skip,
    onSkip,
    children
  } = t0;
  let t1;
  let t2;
  if ($[0] !== onSkip || $[1] !== skip) {
    t1 = () => {
      if (skip) {
        onSkip();
      }
    };
    t2 = [skip, onSkip];
    $[0] = onSkip;
    $[1] = skip;
    $[2] = t1;
    $[3] = t2;
  } else {
    t1 = $[2];
    t2 = $[3];
  }
  useEffect(t1, t2);
  if (skip) {
    return null;
  }
  return children;
}
