import figures from 'figures';
import { homedir } from 'os';
import * as React from 'react';
import { Box, Text } from '../../ink.js';
import type { Step } from '../../projectOnboardingState.js';
import { formatCreditAmount, getCachedReferrerReward } from '../../services/api/referral.js';
import type { LogOption } from '../../types/logs.js';
import { getCwd } from '../../utils/cwd.js';
import { formatRelativeTimeAgo } from '../../utils/format.js';
import type { FeedConfig, FeedLine } from './Feed.js';
import type { TFunc } from '../../i18n/core.js';
export function createRecentActivityFeed(activities: LogOption[], t: TFunc): FeedConfig {
  const lines: FeedLine[] = activities.map(log => {
    const time = formatRelativeTimeAgo(log.modified);
    const description = log.summary && log.summary !== 'No prompt' ? log.summary : log.firstPrompt;
    return {
      text: description || '',
      timestamp: time
    };
  });
  return {
    title: t('feed.recentActivity'),
    lines,
    footer: lines.length > 0 ? '/resume for more' : undefined,
    emptyMessage: t('feed.noRecentActivity')
  };
}
export function createWhatsNewFeed(releaseNotes: string[], t: TFunc): FeedConfig {
  const lines: FeedLine[] = releaseNotes.map(note => {
    if ("external" === 'ant') {
      const match = note.match(/^(\d+\s+\w+\s+ago)\s+(.+)$/);
      if (match) {
        return {
          timestamp: match[1],
          text: match[2] || ''
        };
      }
    }
    return {
      text: note
    };
  });
  const emptyMessage = "external" === 'ant' ? t('feed.antEmptyMessage') : t('feed.changelogMessage');
  return {
    title: "external" === 'ant' ? t('feed.antWhatsNew') : t('feed.whatsNew'),
    lines,
    footer: lines.length > 0 ? '/release-notes for more' : undefined,
    emptyMessage
  };
}
export function createProjectOnboardingFeed(steps: Step[], t: TFunc): FeedConfig {
  const enabledSteps = steps.filter(({
    isEnabled
  }) => isEnabled).sort((a, b) => Number(a.isComplete) - Number(b.isComplete));
  const lines: FeedLine[] = enabledSteps.map(({
    text,
    isComplete
  }) => {
    const checkmark = isComplete ? `${figures.tick} ` : '';
    return {
      text: `${checkmark}${text}`
    };
  });
  const warningText = getCwd() === homedir() ? t('feed.homeDirWarning') : undefined;
  if (warningText) {
    lines.push({
      text: warningText
    });
  }
  return {
    title: t('feed.tipsTitle'),
    lines
  };
}
export function createGuestPassesFeed(t: TFunc): FeedConfig {
  const reward = getCachedReferrerReward();
  const subtitle = reward ? t('feed.shareTextWithReward', { amount: formatCreditAmount(reward) }) : t('feed.shareText');
  return {
    title: '3 guest passes',
    lines: [],
    customContent: {
      content: <>
          <Box marginY={1}>
            <Text color="claude">[✻] [✻] [✻]</Text>
          </Box>
          <Text dimColor>{subtitle}</Text>
        </>,
      width: 48
    },
    footer: '/passes'
  };
}
