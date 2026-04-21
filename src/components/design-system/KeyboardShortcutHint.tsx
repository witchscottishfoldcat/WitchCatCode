import { c as _c } from "react/compiler-runtime";
import React from 'react';
import Text from '../../ink/components/Text.js';
import { t } from '../../i18n/core.js';

const ACTION_KEY_MAP: Record<string, string> = {
  cancel: 'action.cancel',
  confirm: 'action.confirm',
  navigate: 'action.navigate',
  nav: 'action.nav',
  select: 'action.select',
  expand: 'action.expand',
  manage: 'action.manage',
  copy: 'action.copy',
  'go back': 'action.goBack',
  close: 'action.close',
  teleport: 'action.teleport',
  stop: 'action.stop',
  'stop all agents': 'action.stopAllAgents',
  'run in background': 'action.runInBackground',
  foreground: 'action.foreground',
  view: 'action.view',
  continue: 'action.continue',
  submit: 'action.submit',
  add: 'action.add',
  complete: 'action.complete',
  toggle: 'action.toggle',
  unset: 'action.unset',
  switch: 'action.switch',
  'enter text': 'action.enterText',
  'toggle selection': 'action.toggleSelection',
  'search history': 'action.searchHistory',
  stash: 'action.stash',
  retry: 'action.retry',
  back: 'action.back',
  'open in editor': 'action.openInEditor',
  connect: 'action.connect',
  disconnect: 'action.disconnect',
  refresh: 'action.refresh',
  edit: 'action.edit',
  delete: 'action.delete',
  next: 'action.next',
  previous: 'action.previous',
}

function resolveActionLabel(action: string): string {
  const key = ACTION_KEY_MAP[action]
  if (key) return t(key)
  return action
}

type Props = {
  /** The key or chord to display (e.g., "ctrl+o", "Enter", "↑/↓") */
  shortcut: string;
  /** The action the key performs (e.g., "expand", "select", "navigate") */
  action: string;
  /** Whether to wrap the hint in parentheses. Default: false */
  parens?: boolean;
  /** Whether to render the shortcut in bold. Default: false */
  bold?: boolean;
};

/**
 * Renders a keyboard shortcut hint like "ctrl+o to expand" or "(tab to toggle)"
 *
 * Wrap in <Text dimColor> for the common dim styling.
 *
 * @example
 * // Simple hint wrapped in dim Text
 * <Text dimColor><KeyboardShortcutHint shortcut="esc" action="cancel" /></Text>
 *
 * // With parentheses: "(ctrl+o to expand)"
 * <Text dimColor><KeyboardShortcutHint shortcut="ctrl+o" action="expand" parens /></Text>
 *
 * // With bold shortcut: "Enter to confirm" (Enter is bold)
 * <Text dimColor><KeyboardShortcutHint shortcut="Enter" action="confirm" bold /></Text>
 *
 * // Multiple hints with middot separator - use Byline
 * <Text dimColor>
 *   <Byline>
 *     <KeyboardShortcutHint shortcut="Enter" action="confirm" />
 *     <KeyboardShortcutHint shortcut="Esc" action="cancel" />
 *   </Byline>
 * </Text>
 */
export function KeyboardShortcutHint(t0) {
  const $ = _c(9);
  const {
    shortcut,
    action,
    parens: t1,
    bold: t2
  } = t0;
  const parens = t1 === undefined ? false : t1;
  const bold = t2 === undefined ? false : t2;
  let t3;
  if ($[0] !== bold || $[1] !== shortcut) {
    t3 = bold ? <Text bold={true}>{shortcut}</Text> : shortcut;
    $[0] = bold;
    $[1] = shortcut;
    $[2] = t3;
  } else {
    t3 = $[2];
  }
  const shortcutText = t3;
  const actionLabel = resolveActionLabel(action);
  if (parens) {
    let t4;
    if ($[3] !== actionLabel || $[4] !== shortcutText) {
      t4 = <Text>({t('shortcut.to', { shortcut: shortcutText, action: actionLabel })})</Text>;
      $[3] = actionLabel;
      $[4] = shortcutText;
      $[5] = t4;
    } else {
      t4 = $[5];
    }
    return t4;
  }
  let t4;
  if ($[6] !== actionLabel || $[7] !== shortcutText) {
    t4 = <Text>{t('shortcut.to', { shortcut: shortcutText, action: actionLabel })}</Text>;
    $[6] = actionLabel;
    $[7] = shortcutText;
    $[8] = t4;
  } else {
    t4 = $[8];
  }
  return t4;
}
