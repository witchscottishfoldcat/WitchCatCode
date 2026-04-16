import { c as _c } from "react/compiler-runtime";
import * as React from 'react';
import { Markdown } from '../../components/Markdown.js';
import { useI18n } from '../../hooks/useI18n.js';
import { Box, Text } from '../../ink.js';
import { jsonParse } from '../../utils/slowOperations.js';
import { type IdleNotificationMessage, isIdleNotification, isPlanApprovalRequest, isPlanApprovalResponse, type PlanApprovalRequestMessage, type PlanApprovalResponseMessage } from '../../utils/teammateMailbox.js';
import { getShutdownMessageSummary } from './ShutdownMessage.js';
import { getTaskAssignmentSummary } from './TaskAssignmentMessage.js';
import type { TFunc } from '../../i18n/core.js';
type PlanApprovalRequestProps = {
  request: PlanApprovalRequestMessage;
};

/**
 * Renders a plan approval request with a planMode-colored border,
 * showing the plan content and instructions for approving/rejecting.
 */
export function PlanApprovalRequestDisplay(t0) {
  const { t } = useI18n();
  const $ = _c(10);
  const {
    request
  } = t0;
  const requestFromText = t('planApproval.requestFrom', { from: request.from });
  let t1;
  if ($[0] !== request.from) {
    t1 = <Box marginBottom={1}><Text color="planMode" bold={true}>{requestFromText}</Text></Box>;
    $[0] = request.from;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  let t2;
  if ($[2] !== request.planContent) {
    t2 = <Box borderStyle="dashed" borderColor="subtle" borderLeft={false} borderRight={false} flexDirection="column" paddingX={1} marginBottom={1}><Markdown>{request.planContent}</Markdown></Box>;
    $[2] = request.planContent;
    $[3] = t2;
  } else {
    t2 = $[3];
  }
  let t3;
  if ($[4] !== request.planFilePath) {
    t3 = <Text dimColor={true}>{t('planApproval.planFile', { path: request.planFilePath })}</Text>;
    $[4] = request.planFilePath;
    $[5] = t3;
  } else {
    t3 = $[5];
  }
  let t4;
  if ($[6] !== t1 || $[7] !== t2 || $[8] !== t3) {
    t4 = <Box flexDirection="column" marginY={1}><Box borderStyle="round" borderColor="planMode" flexDirection="column" paddingX={1}>{t1}{t2}{t3}</Box></Box>;
    $[6] = t1;
    $[7] = t2;
    $[8] = t3;
    $[9] = t4;
  } else {
    t4 = $[9];
  }
  return t4;
}
type PlanApprovalResponseProps = {
  response: PlanApprovalResponseMessage;
  senderName: string;
};

/**
 * Renders a plan approval response with a success (green) or error (red) border.
 */
export function PlanApprovalResponseDisplay(t0) {
  const { t } = useI18n();
  const $ = _c(13);
  const {
    response,
    senderName
  } = t0;
  if (response.approved) {
    const approvedText = t('planApproval.approved', { sender: senderName });
    let t1;
    if ($[0] !== senderName) {
      t1 = <Box><Text color="success" bold={true}>✓ {approvedText}</Text></Box>;
      $[0] = senderName;
      $[1] = t1;
    } else {
      t1 = $[1];
    }
    const approvedDesc = t('planApproval.approvedDesc');
    let t2;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
      t2 = <Box marginTop={1}><Text>{approvedDesc}</Text></Box>;
      $[2] = t2;
    } else {
      t2 = $[2];
    }
    let t3;
    if ($[3] !== t1) {
      t3 = <Box flexDirection="column" marginY={1}><Box borderStyle="round" borderColor="success" flexDirection="column" paddingX={1} paddingY={1}>{t1}{t2}</Box></Box>;
      $[3] = t1;
      $[4] = t3;
    } else {
      t3 = $[4];
    }
    return t3;
  }
  const rejectedText = t('planApproval.rejected', { sender: senderName });
  let t1;
  if ($[5] !== senderName) {
    t1 = <Box><Text color="error" bold={true}>✗ {rejectedText}</Text></Box>;
    $[5] = senderName;
    $[6] = t1;
  } else {
    t1 = $[6];
  }
  let t2;
  if ($[7] !== response.feedback) {
    t2 = response.feedback && <Box marginTop={1} borderStyle="dashed" borderColor="subtle" borderLeft={false} borderRight={false} paddingX={1}><Text>{t('planApproval.feedback', { feedback: response.feedback })}</Text></Box>;
    $[7] = response.feedback;
    $[8] = t2;
  } else {
    t2 = $[8];
  }
  const reviseText = t('planApproval.revisePlan');
  let t3;
  if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
    t3 = <Box marginTop={1}><Text dimColor={true}>{reviseText}</Text></Box>;
    $[9] = t3;
  } else {
    t3 = $[9];
  }
  let t4;
  if ($[10] !== t1 || $[11] !== t2) {
    t4 = <Box flexDirection="column" marginY={1}><Box borderStyle="round" borderColor="error" flexDirection="column" paddingX={1} paddingY={1}>{t1}{t2}{t3}</Box></Box>;
    $[10] = t1;
    $[11] = t2;
    $[12] = t4;
  } else {
    t4 = $[12];
  }
  return t4;
}

/**
 * Try to parse and render a plan approval message from raw content.
 * Returns the rendered component if it's a plan approval message, null otherwise.
 */
export function tryRenderPlanApprovalMessage(content: string, senderName: string): React.ReactNode | null {
  const request = isPlanApprovalRequest(content);
  if (request) {
    return <PlanApprovalRequestDisplay request={request} />;
  }
  const response = isPlanApprovalResponse(content);
  if (response) {
    return <PlanApprovalResponseDisplay response={response} senderName={senderName} />;
  }
  return null;
}

/**
 * Get a brief summary text for a plan approval message.
 * Used in places like the inbox queue where we want a short description.
 * Returns null if the content is not a plan approval message.
 */
function getPlanApprovalSummary(content: string, t: TFunc): string | null {
  const request = isPlanApprovalRequest(content);
  if (request) {
    return t('planApproval.requestSummary', { from: request.from });
  }
  const response = isPlanApprovalResponse(content);
  if (response) {
    if (response.approved) {
      return t('planApproval.approvedSummary');
    } else {
      return t('planApproval.rejectedSummary', { feedback: response.feedback || t('planApproval.revisePlanShort') });
    }
  }
  return null;
}

/**
 * Get a brief summary text for an idle notification.
 */
function getIdleNotificationSummary(msg: IdleNotificationMessage, t: TFunc): string {
  const parts: string[] = [t('planApproval.agentIdle')];
  if (msg.completedTaskId) {
    const status = msg.completedStatus || t('planApproval.completed');
    parts.push(t('planApproval.taskStatus', { taskId: String(msg.completedTaskId), status }));
  }
  if (msg.summary) {
    parts.push(t('planApproval.lastDm', { summary: msg.summary }));
  }
  return parts.join(' \u00b7 ');
}

/**
 * Format teammate message content for display.
 * If it's a structured message (plan approval, shutdown, or idle), returns a formatted summary.
 * Otherwise returns the original content.
 */
export function formatTeammateMessageContent(content: string, t: TFunc): string {
  const planSummary = getPlanApprovalSummary(content, t);
  if (planSummary) {
    return planSummary;
  }
  const shutdownSummary = getShutdownMessageSummary(content);
  if (shutdownSummary) {
    return shutdownSummary;
  }
  const idleMsg = isIdleNotification(content);
  if (idleMsg) {
    return getIdleNotificationSummary(idleMsg, t);
  }
  const taskAssignmentSummary = getTaskAssignmentSummary(content);
  if (taskAssignmentSummary) {
    return taskAssignmentSummary;
  }

  // Check for teammate_terminated message
  try {
    const parsed = jsonParse(content) as {
      type?: string;
      message?: string;
    };
    if (parsed?.type === 'teammate_terminated' && parsed.message) {
      return parsed.message;
    }
  } catch {
    // Not JSON
  }
  return content;
}
