import { c as _c } from "react/compiler-runtime";
import React from 'react';
import { useI18n } from '../../hooks/useI18n.js';
import { Box, Text } from '../../ink.js';
import { extractMcpToolDisplayName, getMcpDisplayName } from '../../services/mcp/mcpStringUtils.js';
import type { Tool } from '../../Tool.js';
import { ConfigurableShortcutHint } from '../ConfigurableShortcutHint.js';
import { Dialog } from '../design-system/Dialog.js';
import type { ServerInfo } from './types.js';
type Props = {
  tool: Tool;
  server: ServerInfo;
  onBack: () => void;
};
export function MCPToolDetailView(t0) {
  const $ = _c(50);
  const {
    tool,
    server,
    onBack
  } = t0;
  const { t } = useI18n();
  const [toolDescription, setToolDescription] = React.useState("");
  let t1;
  let toolName;
  if ($[0] !== server.name || $[1] !== tool) {
    toolName = getMcpDisplayName(tool.name, server.name);
    const fullDisplayName = tool.userFacingName ? tool.userFacingName({}) : toolName;
    t1 = extractMcpToolDisplayName(fullDisplayName);
    $[0] = server.name;
    $[1] = tool;
    $[2] = t1;
    $[3] = toolName;
  } else {
    t1 = $[2];
    toolName = $[3];
  }
  const displayName = t1;
  let t2;
  if ($[4] !== tool) {
    t2 = tool.isReadOnly?.({}) ?? false;
    $[4] = tool;
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  const isReadOnly = t2;
  let t3;
  if ($[6] !== tool) {
    t3 = tool.isDestructive?.({}) ?? false;
    $[6] = tool;
    $[7] = t3;
  } else {
    t3 = $[7];
  }
  const isDestructive = t3;
  let t4;
  if ($[8] !== tool) {
    t4 = tool.isOpenWorld?.({}) ?? false;
    $[8] = tool;
    $[9] = t4;
  } else {
    t4 = $[9];
  }
  const isOpenWorld = t4;
  let t5;
  let t6;
  if ($[10] !== tool) {
    t5 = () => {
      const loadDescription = async function loadDescription() {
        try {
          const desc = await tool.description({}, {
            isNonInteractiveSession: false,
            toolPermissionContext: {
              mode: "default" as const,
              additionalWorkingDirectories: new Map(),
              alwaysAllowRules: {},
              alwaysDenyRules: {},
              alwaysAskRules: {},
              isBypassPermissionsModeAvailable: false
            },
            tools: []
          });
          setToolDescription(desc);
        } catch {
          setToolDescription(t('mcp.toolDetail.loadDescriptionFailed'));
        }
      };
      loadDescription();
    };
    t6 = [tool];
    $[10] = tool;
    $[11] = t5;
    $[12] = t6;
  } else {
    t5 = $[11];
    t6 = $[12];
  }
  React.useEffect(t5, t6);
  let t7;
  if ($[13] !== isReadOnly) {
    t7 = isReadOnly && <Text color="success"> [{t('mcp.toolDetail.readOnly')}]</Text>;
    $[13] = isReadOnly;
    $[14] = t7;
  } else {
    t7 = $[14];
  }
  let t8;
  if ($[15] !== isDestructive) {
    t8 = isDestructive && <Text color="error"> [{t('mcp.toolDetail.destructive')}]</Text>;
    $[15] = isDestructive;
    $[16] = t8;
  } else {
    t8 = $[16];
  }
  let t9;
  if ($[17] !== isOpenWorld) {
    t9 = isOpenWorld && <Text dimColor={true}> [{t('mcp.toolDetail.openWorld')}]</Text>;
    $[17] = isOpenWorld;
    $[18] = t9;
  } else {
    t9 = $[18];
  }
  let t10;
  if ($[19] !== displayName || $[20] !== t7 || $[21] !== t8 || $[22] !== t9) {
    t10 = <>{displayName}{t7}{t8}{t9}</>;
    $[19] = displayName;
    $[20] = t7;
    $[21] = t8;
    $[22] = t9;
    $[23] = t10;
  } else {
    t10 = $[23];
  }
  const titleContent = t10;
  const toolNameLabel = t('mcp.toolDetail.toolName');
  let t11;
  if ($[24] !== toolNameLabel) {
    t11 = <Text bold={true}>{toolNameLabel}: </Text>;
    $[24] = toolNameLabel;
    $[25] = t11;
  } else {
    t11 = $[25];
  }
  let t12;
  if ($[26] !== toolName) {
    t12 = <Box>{t11}<Text dimColor={true}>{toolName}</Text></Box>;
    $[26] = toolName;
    $[27] = t12;
  } else {
    t12 = $[27];
  }
  const fullNameLabel = t('mcp.toolDetail.fullName');
  let t13;
  if ($[28] !== fullNameLabel) {
    t13 = <Text bold={true}>{fullNameLabel}: </Text>;
    $[28] = fullNameLabel;
    $[29] = t13;
  } else {
    t13 = $[29];
  }
  let t14;
  if ($[30] !== tool.name) {
    t14 = <Box>{t13}<Text dimColor={true}>{tool.name}</Text></Box>;
    $[30] = tool.name;
    $[31] = t14;
  } else {
    t14 = $[31];
  }
  const descriptionLabel = t('mcp.toolDetail.description');
  let t15;
  if ($[32] !== descriptionLabel || $[33] !== toolDescription) {
    t15 = toolDescription && <Box flexDirection="column" marginTop={1}><Text bold={true}>{descriptionLabel}:</Text><Text wrap="wrap">{toolDescription}</Text></Box>;
    $[32] = descriptionLabel;
    $[33] = toolDescription;
    $[34] = t15;
  } else {
    t15 = $[34];
  }
  const parametersLabel = t('mcp.toolDetail.parameters');
  const requiredLabel = t('mcp.toolDetail.required');
  let t16;
  if ($[35] !== parametersLabel || $[36] !== requiredLabel || $[37] !== tool.inputJSONSchema) {
    t16 = tool.inputJSONSchema && tool.inputJSONSchema.properties && Object.keys(tool.inputJSONSchema.properties).length > 0 && <Box flexDirection="column" marginTop={1}><Text bold={true}>{parametersLabel}:</Text><Box marginLeft={2} flexDirection="column">{Object.entries(tool.inputJSONSchema.properties).map(t17 => {
          const [key, value] = t17;
          const required = tool.inputJSONSchema?.required as string[] | undefined;
          const isRequired = required?.includes(key);
          return <Text key={key}>• {key}{isRequired && <Text dimColor={true}> ({requiredLabel})</Text>}:{" "}<Text dimColor={true}>{typeof value === "object" && value && "type" in value ? String(value.type) : "unknown"}</Text>{typeof value === "object" && value && "description" in value && <Text dimColor={true}> - {String(value.description)}</Text>}</Text>;
        })}</Box></Box>;
    $[35] = parametersLabel;
    $[36] = requiredLabel;
    $[37] = tool.inputJSONSchema;
    $[38] = t16;
  } else {
    t16 = $[38];
  }
  let t17;
  if ($[39] !== t12 || $[40] !== t14 || $[41] !== t15 || $[42] !== t16) {
    t17 = <Box flexDirection="column">{t12}{t14}{t15}{t16}</Box>;
    $[39] = t12;
    $[40] = t14;
    $[41] = t15;
    $[42] = t16;
    $[43] = t17;
  } else {
    t17 = $[43];
  }
  const pressAgainText = t('mcp.remote.pressAgainToExit');
  let t18;
  if ($[44] !== onBack || $[45] !== pressAgainText || $[46] !== server.name || $[47] !== t17 || $[48] !== titleContent) {
    t18 = <Dialog title={titleContent} subtitle={server.name} onCancel={onBack} inputGuide={exitState => exitState.pending ? <Text>{pressAgainText}</Text> : <ConfigurableShortcutHint action="confirm:no" context="Confirmation" fallback="Esc" description="go back" />}>{t17}</Dialog>;
    $[44] = onBack;
    $[45] = pressAgainText;
    $[46] = server.name;
    $[47] = t17;
    $[48] = titleContent;
    $[49] = t18;
  } else {
    t18 = $[49];
  }
  return t18;
}
