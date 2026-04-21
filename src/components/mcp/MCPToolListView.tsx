import { c as _c } from "react/compiler-runtime";
import React from 'react';
import { useI18n } from '../../hooks/useI18n.js';
import { Text } from '../../ink.js';
import { extractMcpToolDisplayName, getMcpDisplayName } from '../../services/mcp/mcpStringUtils.js';
import { filterToolsByServer } from '../../services/mcp/utils.js';
import { useAppState } from '../../state/AppState.js';
import type { Tool } from '../../Tool.js';
import { ConfigurableShortcutHint } from '../ConfigurableShortcutHint.js';
import { Select } from '../CustomSelect/index.js';
import { Byline } from '../design-system/Byline.js';
import { Dialog } from '../design-system/Dialog.js';
import { KeyboardShortcutHint } from '../design-system/KeyboardShortcutHint.js';
import type { ServerInfo } from './types.js';
type Props = {
  server: ServerInfo;
  onSelectTool: (tool: Tool, index: number) => void;
  onBack: () => void;
};
export function MCPToolListView(t0) {
  const $ = _c(22);
  const {
    server,
    onSelectTool,
    onBack
  } = t0;
  const { t } = useI18n();
  const mcpTools = useAppState(_temp);
  let t1;
  bb0: {
    if (server.client.type !== "connected") {
      let t2;
      if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = [];
        $[0] = t2;
      } else {
        t2 = $[0];
      }
      t1 = t2;
      break bb0;
    }
    let t2;
    if ($[1] !== mcpTools || $[2] !== server.name) {
      t2 = filterToolsByServer(mcpTools, server.name);
      $[1] = mcpTools;
      $[2] = server.name;
      $[3] = t2;
    } else {
      t2 = $[3];
    }
    t1 = t2;
  }
  const serverTools = t1;
  let t2;
  if ($[4] !== server.name || $[5] !== serverTools) {
    let t3;
    if ($[7] !== server.name) {
      t3 = (tool, index) => {
        const toolName = getMcpDisplayName(tool.name, server.name);
        const fullDisplayName = tool.userFacingName ? tool.userFacingName({}) : toolName;
        const displayName = extractMcpToolDisplayName(fullDisplayName);
        const isReadOnly = tool.isReadOnly?.({}) ?? false;
        const isDestructive = tool.isDestructive?.({}) ?? false;
        const isOpenWorld = tool.isOpenWorld?.({}) ?? false;
        const annotations = [];
        if (isReadOnly) {
          annotations.push(t('mcp.toolDetail.readOnly'));
        }
        if (isDestructive) {
          annotations.push(t('mcp.toolDetail.destructive'));
        }
        if (isOpenWorld) {
          annotations.push(t('mcp.toolDetail.openWorld'));
        }
        return {
          label: displayName,
          value: index.toString(),
          description: annotations.length > 0 ? annotations.join(", ") : undefined,
          descriptionColor: isDestructive ? "error" : isReadOnly ? "success" : undefined
        };
      };
      $[7] = server.name;
      $[8] = t3;
    } else {
      t3 = $[8];
    }
    t2 = serverTools.map(t3);
    $[4] = server.name;
    $[5] = serverTools;
    $[6] = t2;
  } else {
    t2 = $[6];
  }
  const toolOptions = t2;
  const t3 = t('mcp.toolList.title', { serverName: server.name });
  const t4 = serverTools.length;
  const t6 = t('mcp.toolList.toolCount', { count: String(t4) });
  let t7;
  if ($[11] !== onBack || $[12] !== onSelectTool || $[13] !== serverTools || $[14] !== toolOptions) {
    t7 = serverTools.length === 0 ? <Text dimColor={true}>{t('mcp.toolList.noTools')}</Text> : <Select options={toolOptions} onChange={value => {
      const index_0 = parseInt(value);
      const tool_0 = serverTools[index_0];
      if (tool_0) {
        onSelectTool(tool_0, index_0);
      }
    }} onCancel={onBack} />;
    $[11] = onBack;
    $[12] = onSelectTool;
    $[13] = serverTools;
    $[14] = toolOptions;
    $[15] = t7;
  } else {
    t7 = $[15];
  }
  const pressAgainText = t('mcp.remote.pressAgainToExit');
  let t8;
  if ($[16] !== onBack || $[17] !== pressAgainText || $[18] !== t3 || $[19] !== t6 || $[20] !== t7) {
    t8 = <Dialog title={t3} subtitle={t6} onCancel={onBack} inputGuide={exitState => exitState.pending ? <Text>{pressAgainText}</Text> : <Byline><KeyboardShortcutHint shortcut={"\u2191\u2193"} action="navigate" /><KeyboardShortcutHint shortcut="Enter" action="select" /><ConfigurableShortcutHint action="confirm:no" context="Confirmation" fallback="Esc" description="back" /></Byline>}>{t7}</Dialog>;
    $[16] = onBack;
    $[17] = pressAgainText;
    $[18] = t3;
    $[19] = t6;
    $[20] = t7;
    $[21] = t8;
  } else {
    t8 = $[21];
  }
  return t8;
}
function _temp(s) {
  return s.mcp.tools;
}
