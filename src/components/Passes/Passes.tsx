import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { CommandResultDisplay } from '../../commands.js';
import { TEARDROP_ASTERISK } from '../../constants/figures.js';
import { useExitOnCtrlCDWithKeybindings } from '../../hooks/useExitOnCtrlCDWithKeybindings.js';
import { useI18n } from '../../hooks/useI18n.js';
import { setClipboard } from '../../ink/termio/osc.js';
// eslint-disable-next-line custom-rules/prefer-use-keybindings -- enter to copy link
import { Box, Link, Text, useInput } from '../../ink.js';
import { useKeybinding } from '../../keybindings/useKeybinding.js';
import { logEvent } from '../../services/analytics/index.js';
import { fetchReferralRedemptions, formatCreditAmount, getCachedOrFetchPassesEligibility } from '../../services/api/referral.js';
import type { ReferralRedemptionsResponse, ReferrerRewardInfo } from '../../services/oauth/types.js';
import { count } from '../../utils/array.js';
import { logError } from '../../utils/log.js';
import { Pane } from '../design-system/Pane.js';
type PassStatus = {
  passNumber: number;
  isAvailable: boolean;
};
type Props = {
  onDone: (result?: string, options?: {
    display?: CommandResultDisplay;
  }) => void;
};
export function Passes({
  onDone
}: Props): React.ReactNode {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [passStatuses, setPassStatuses] = useState<PassStatus[]>([]);
  const [isAvailable, setIsAvailable] = useState(false);
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [referrerReward, setReferrerReward] = useState<ReferrerRewardInfo | null | undefined>(undefined);
  const exitState = useExitOnCtrlCDWithKeybindings(() => onDone(t('passes.dialogDismissed'), {
      display: 'system'
    }));
  const handleCancel = useCallback(() => {
    onDone(t('passes.dialogDismissed'), {
      display: 'system'
    });
  }, [onDone]);
  useKeybinding('confirm:no', handleCancel, {
    context: 'Confirmation'
  });
  useInput((_input, key) => {
    if (key.return && referralLink) {
      void setClipboard(referralLink).then(raw => {
        if (raw) process.stdout.write(raw);
        logEvent('tengu_guest_passes_link_copied', {});
        onDone(t('passes.referralLinkCopied'));
      });
    }
  });
  useEffect(() => {
    async function loadPassesData() {
      try {
        // Check eligibility first (uses cache if available)
        const eligibilityData = await getCachedOrFetchPassesEligibility();
        if (!eligibilityData || !eligibilityData.eligible) {
          setIsAvailable(false);
          setLoading(false);
          return;
        }
        setIsAvailable(true);

        // Store the referral link if available
        if (eligibilityData.referral_code_details?.referral_link) {
          setReferralLink(eligibilityData.referral_code_details.referral_link);
        }

        // Store referrer reward info for v1 campaign messaging
        setReferrerReward(eligibilityData.referrer_reward);

        // Use the campaign returned from eligibility for redemptions
        const campaign = eligibilityData.referral_code_details?.campaign ?? 'claude_code_guest_pass';

        // Fetch redemptions data
        let redemptionsData: ReferralRedemptionsResponse;
        try {
          redemptionsData = await fetchReferralRedemptions(campaign);
        } catch (err_0) {
          logError(err_0 as Error);
          setIsAvailable(false);
          setLoading(false);
          return;
        }

        // Build pass statuses array
        const redemptions = redemptionsData.redemptions || [];
        const maxRedemptions = redemptionsData.limit || 3;
        const statuses: PassStatus[] = [];
        for (let i = 0; i < maxRedemptions; i++) {
          const redemption = redemptions[i];
          statuses.push({
            passNumber: i + 1,
            isAvailable: !redemption
          });
        }
        setPassStatuses(statuses);
        setLoading(false);
      } catch (err) {
        // For any error, just show passes as not available
        logError(err as Error);
        setIsAvailable(false);
        setLoading(false);
      }
    }
    void loadPassesData();
  }, []);
  if (loading) {
    return <Pane>
        <Box flexDirection="column" gap={1}>
          <Text dimColor>{t('passes.loadingInfo')}</Text>
          <Text dimColor italic>
            {exitState.pending ? <>{t('passes.pressAgainToExit', { key: exitState.keyName })}</> : <>{t('passes.escToCancel')}</>}
          </Text>
        </Box>
      </Pane>;
  }
  if (!isAvailable) {
    return <Pane>
        <Box flexDirection="column" gap={1}>
          <Text>{t('passes.notAvailable')}</Text>
          <Text dimColor italic>
            {exitState.pending ? <>{t('passes.pressAgainToExit', { key: exitState.keyName })}</> : <>{t('passes.escToCancel')}</>}
          </Text>
        </Box>
      </Pane>;
  }
  const availableCount = count(passStatuses, p => p.isAvailable);

  // Sort passes: available first, then redeemed
  const sortedPasses = [...passStatuses].sort((a, b) => +b.isAvailable - +a.isAvailable);

  // ASCII art for tickets
  const renderTicket = (pass: PassStatus) => {
    const isRedeemed = !pass.isAvailable;
    if (isRedeemed) {
      // Grayed out redeemed ticket with slashes
      return <Box key={pass.passNumber} flexDirection="column" marginRight={1}>
          <Text dimColor>{'┌─────────╱'}</Text>
          <Text dimColor>{` ) CC ${TEARDROP_ASTERISK} ┊╱`}</Text>
          <Text dimColor>{'└───────╱'}</Text>
        </Box>;
    }
    return <Box key={pass.passNumber} flexDirection="column" marginRight={1}>
        <Text>{'┌──────────┐'}</Text>
        <Text>
          {' ) CC '}
          <Text color="claude">{TEARDROP_ASTERISK}</Text>
          {' ┊ ( '}
        </Text>
        <Text>{'└──────────┘'}</Text>
      </Box>;
  };
  return <Pane>
      <Box flexDirection="column" gap={1}>
        <Text color="permission">{t('passes.title', { count: availableCount })}</Text>

        <Box flexDirection="row" marginLeft={2}>
          {sortedPasses.slice(0, 3).map(pass_0 => renderTicket(pass_0))}
        </Box>

        {referralLink && <Box marginLeft={2}>
            <Text>{referralLink}</Text>
          </Box>}

        <Box flexDirection="column" marginLeft={2}>
          <Text dimColor>
            {referrerReward ? t('passes.shareWithReward', { amount: formatCreditAmount(referrerReward) }) : t('passes.shareWithoutReward')}
            <Link url={referrerReward ? 'https://support.claude.com/en/articles/13456702-claude-code-guest-passes' : 'https://support.claude.com/en/articles/12875061-claude-code-guest-passes'}>
              {t('passes.termsApply')}
            </Link>
          </Text>
        </Box>

        <Box>
          <Text dimColor italic>
            {exitState.pending ? <>{t('passes.pressAgainToExit', { key: exitState.keyName })}</> : <>{t('passes.enterToCopyEscToCancel')}</>}
          </Text>
        </Box>
      </Box>
    </Pane>;
}
