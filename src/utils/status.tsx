import chalk from 'chalk';
import figures from 'figures';
import * as React from 'react';
import { t } from '../i18n/core.js';
import { color, Text } from '../ink.js';
import type { MCPServerConnection } from '../services/mcp/types.js';
import { getAccountInformation, isClaudeAISubscriber } from './auth.js';
import { getLargeMemoryFiles, getMemoryFiles, MAX_MEMORY_CHARACTER_COUNT } from './claudemd.js';
import { getDoctorDiagnostic } from './doctorDiagnostic.js';
import { getAWSRegion, getDefaultVertexRegion, isEnvTruthy } from './envUtils.js';
import { getDisplayPath } from './file.js';
import { formatNumber } from './format.js';
import { getIdeClientName, type IDEExtensionInstallationStatus, isJetBrainsIde, toIDEDisplayName } from './ide.js';
import { getClaudeAiUserDefaultModelDescription, modelDisplayString } from './model/model.js';
import { getAPIProvider } from './model/providers.js';
import { getMTLSConfig } from './mtls.js';
import { checkInstall } from './nativeInstaller/index.js';
import { getProxyUrl } from './proxy.js';
import { SandboxManager } from './sandbox/sandbox-adapter.js';
import { getSettingsWithAllErrors } from './settings/allErrors.js';
import { getEnabledSettingSources, getSettingSourceDisplayNameCapitalized } from './settings/constants.js';
import { getManagedFileSettingsPresence, getPolicySettingsOrigin, getSettingsForSource } from './settings/settings.js';
import type { ThemeName } from './theme.js';
export type Property = {
  label?: string;
  value: React.ReactNode | Array<string>;
};
export type Diagnostic = React.ReactNode;
export function buildSandboxProperties(): Property[] {
  if ("external" !== 'ant') {
    return [];
  }
  const isSandboxed = SandboxManager.isSandboxingEnabled();
  return [{
    label: t('status.sandbox.label'),
    value: isSandboxed ? t('status.sandbox.enabled') : t('status.sandbox.disabled')
  }];
}
export function buildIDEProperties(mcpClients: MCPServerConnection[], ideInstallationStatus: IDEExtensionInstallationStatus | null = null, theme: ThemeName): Property[] {
  const ideClient = mcpClients?.find(client => client.name === 'ide');
  if (ideInstallationStatus) {
    const ideName = toIDEDisplayName(ideInstallationStatus.ideType);
    const pluginOrExtension = isJetBrainsIde(ideInstallationStatus.ideType) ? 'plugin' : 'extension';
    if (ideInstallationStatus.error) {
      return [{
        label: t('status.ide.label'),
        value: <Text>
              {color('error', theme)(figures.cross)} {t('status.ide.errorInstalling', { ideName, type: pluginOrExtension })}
              {ideInstallationStatus.error}
              {'\n'}{t('status.ide.restartIde')}
            </Text>
      }];
    }
    if (ideInstallationStatus.installed) {
      if (ideClient && ideClient.type === 'connected') {
        if (ideInstallationStatus.installedVersion !== ideClient.serverInfo?.version) {
          return [{
            label: t('status.ide.label'),
            value: t('status.ide.connectedVersion', { ideName, type: pluginOrExtension, version: `${ideInstallationStatus.installedVersion} (server version: ${ideClient.serverInfo?.version})` })
          }];
        } else {
          return [{
            label: t('status.ide.label'),
            value: t('status.ide.connectedVersion', { ideName, type: pluginOrExtension, version: ideInstallationStatus.installedVersion })
          }];
        }
      } else {
        return [{
          label: t('status.ide.label'),
          value: t('status.ide.installed', { ideName, type: pluginOrExtension })
        }];
      }
    }
  } else if (ideClient) {
    const ideName = getIdeClientName(ideClient) ?? t('status.ide.label');
    if (ideClient.type === 'connected') {
      return [{
        label: t('status.ide.label'),
        value: t('status.ide.connectedExtension', { ideName })
      }];
    } else {
      return [{
        label: t('status.ide.label'),
        value: `${color('error', theme)(figures.cross)} ${t('status.ide.notConnected', { ideName })}`
      }];
    }
  }
  return [];
}
export function buildMcpProperties(clients: MCPServerConnection[] = [], theme: ThemeName): Property[] {
  const servers = clients.filter(client => client.name !== 'ide');
  if (!servers.length) {
    return [];
  }

  // Summary instead of a full server list — 20+ servers wrapped onto many
  // rows, dominating the Status pane. Show counts by state + /mcp hint.
  const byState = {
    connected: 0,
    pending: 0,
    needsAuth: 0,
    failed: 0
  };
  for (const s of servers) {
    if (s.type === 'connected') byState.connected++;else if (s.type === 'pending') byState.pending++;else if (s.type === 'needs-auth') byState.needsAuth++;else byState.failed++;
  }
  const parts: string[] = [];
  if (byState.connected) parts.push(color('success', theme)(t('status.mcp.connected', { n: byState.connected })));
  if (byState.needsAuth) parts.push(color('warning', theme)(t('status.mcp.needAuth', { n: byState.needsAuth })));
  if (byState.pending) parts.push(color('inactive', theme)(t('status.mcp.pending', { n: byState.pending })));
  if (byState.failed) parts.push(color('error', theme)(t('status.mcp.failed', { n: byState.failed })));
  return [{
    label: t('status.mcp.label'),
    value: `${parts.join(', ')} ${color('inactive', theme)('· /mcp')}`
  }];
}
export async function buildMemoryDiagnostics(): Promise<Diagnostic[]> {
  const files = await getMemoryFiles();
  const largeFiles = getLargeMemoryFiles(files);
  const diagnostics: Diagnostic[] = [];
  largeFiles.forEach(file => {
    const displayPath = getDisplayPath(file.path);
    diagnostics.push(t('status.memory.largeFileWarning', { path: displayPath, chars: formatNumber(file.content.length), maxChars: formatNumber(MAX_MEMORY_CHARACTER_COUNT) }));
  });
  return diagnostics;
}
export function buildSettingSourcesProperties(): Property[] {
  const enabledSources = getEnabledSettingSources();

  // Filter to only sources that actually have settings loaded
  const sourcesWithSettings = enabledSources.filter(source => {
    const settings = getSettingsForSource(source);
    return settings !== null && Object.keys(settings).length > 0;
  });

  // Map internal names to user-friendly names
  // For policySettings, distinguish between remote and local (or skip if neither exists)
  const sourceNames = sourcesWithSettings.map(source => {
    if (source === 'policySettings') {
      const origin = getPolicySettingsOrigin();
      if (origin === null) {
        return null; // Skip - no policy settings exist
      }
      switch (origin) {
        case 'remote':
          return t('status.settingsSources.remote');
        case 'plist':
          return t('status.settingsSources.plist');
        case 'hklm':
          return t('status.settingsSources.hklm');
        case 'file':
          {
            const {
              hasBase,
              hasDropIns
            } = getManagedFileSettingsPresence();
            if (hasBase && hasDropIns) {
              return t('status.settingsSources.fileDropins');
            }
            if (hasDropIns) {
              return t('status.settingsSources.dropins');
            }
            return t('status.settingsSources.file');
          }
        case 'hkcu':
          return t('status.settingsSources.hkcu');
      }
    }
    return getSettingSourceDisplayNameCapitalized(source);
  }).filter((name): name is string => name !== null);
  return [{
    label: t('status.settingsSources.label'),
    value: sourceNames
  }];
}
export async function buildInstallationDiagnostics(): Promise<Diagnostic[]> {
  const installWarnings = await checkInstall();
  return installWarnings.map(warning => warning.message);
}
export async function buildInstallationHealthDiagnostics(): Promise<Diagnostic[]> {
  const diagnostic = await getDoctorDiagnostic();
  const items: Diagnostic[] = [];
  const {
    errors: validationErrors
  } = getSettingsWithAllErrors();
  if (validationErrors.length > 0) {
    const invalidFiles = Array.from(new Set(validationErrors.map(error => error.file)));
    const fileList = invalidFiles.join(', ');
    items.push(`Found invalid settings files: ${fileList}. They will be ignored.`);
  }

  // Add warnings from doctor diagnostic (includes leftover installations, config mismatches, etc.)
  diagnostic.warnings.forEach(warning => {
    items.push(warning.issue);
  });
  if (diagnostic.hasUpdatePermissions === false) {
    items.push(t('status.install.noWritePermissions'));
  }
  return items;
}
export function buildAccountProperties(): Property[] {
  const accountInfo = getAccountInformation();
  if (!accountInfo) {
    return [];
  }
  const properties: Property[] = [];
  if (accountInfo.subscription) {
    properties.push({
      label: t('status.account.loginMethod'),
      value: `${accountInfo.subscription} Account`
    });
  }
  if (accountInfo.tokenSource) {
    properties.push({
      label: t('status.account.authToken'),
      value: accountInfo.tokenSource
    });
  }
  if (accountInfo.apiKeySource) {
    properties.push({
      label: t('status.account.apiKey'),
      value: accountInfo.apiKeySource
    });
  }

  // Hide sensitive account info in demo mode
  if (accountInfo.organization && !process.env.IS_DEMO) {
    properties.push({
      label: 'Organization',
      value: accountInfo.organization
    });
  }
  if (accountInfo.email && !process.env.IS_DEMO) {
    properties.push({
      label: t('status.account.email'),
      value: accountInfo.email
    });
  }
  return properties;
}
export function buildAPIProviderProperties(): Property[] {
  const apiProvider = getAPIProvider();
  const properties: Property[] = [];
  if (apiProvider !== 'firstParty') {
    const providerLabel = {
      bedrock: t('status.apiProvider.bedrock'),
      vertex: t('status.apiProvider.vertex'),
      foundry: t('status.apiProvider.foundry')
    }[apiProvider];
    properties.push({
      label: t('status.apiProvider.label'),
      value: providerLabel
    });
  }
  if (apiProvider === 'firstParty') {
    const anthropicBaseUrl = process.env.ANTHROPIC_BASE_URL;
    if (anthropicBaseUrl) {
      properties.push({
        label: t('status.apiProvider.baseUrl'),
        value: anthropicBaseUrl
      });
    }
  } else if (apiProvider === 'bedrock') {
    const bedrockBaseUrl = process.env.BEDROCK_BASE_URL;
    if (bedrockBaseUrl) {
      properties.push({
        label: t('status.apiProvider.bedrockBaseUrl'),
        value: bedrockBaseUrl
      });
    }
    properties.push({
      label: t('status.apiProvider.awsRegion'),
      value: getAWSRegion()
    });
    if (isEnvTruthy(process.env.CLAUDE_CODE_SKIP_BEDROCK_AUTH)) {
      properties.push({
        value: t('status.apiProvider.awsAuthSkipped')
      });
    }
  } else if (apiProvider === 'vertex') {
    const vertexBaseUrl = process.env.VERTEX_BASE_URL;
    if (vertexBaseUrl) {
      properties.push({
        label: t('status.apiProvider.vertexBaseUrl'),
        value: vertexBaseUrl
      });
    }
    const gcpProject = process.env.ANTHROPIC_VERTEX_PROJECT_ID;
    if (gcpProject) {
      properties.push({
        label: t('status.apiProvider.gcpProject'),
        value: gcpProject
      });
    }
    properties.push({
      label: 'Default region',
      value: getDefaultVertexRegion()
    });
    if (isEnvTruthy(process.env.CLAUDE_CODE_SKIP_VERTEX_AUTH)) {
      properties.push({
        value: t('status.apiProvider.gcpAuthSkipped')
      });
    }
  } else if (apiProvider === 'foundry') {
    const foundryBaseUrl = process.env.ANTHROPIC_FOUNDRY_BASE_URL;
    if (foundryBaseUrl) {
      properties.push({
        label: t('status.apiProvider.foundryBaseUrl'),
        value: foundryBaseUrl
      });
    }
    const foundryResource = process.env.ANTHROPIC_FOUNDRY_RESOURCE;
    if (foundryResource) {
      properties.push({
        label: t('status.apiProvider.foundryResource'),
        value: foundryResource
      });
    }
    if (isEnvTruthy(process.env.CLAUDE_CODE_SKIP_FOUNDRY_AUTH)) {
      properties.push({
        value: t('status.apiProvider.foundryAuthSkipped')
      });
    }
  }
  const proxyUrl = getProxyUrl();
  if (proxyUrl) {
    properties.push({
      label: t('status.apiProvider.proxy'),
      value: proxyUrl
    });
  }
  const mtlsConfig = getMTLSConfig();
  if (process.env.NODE_EXTRA_CA_CERTS) {
    properties.push({
      label: t('status.apiProvider.additionalCaCerts'),
      value: process.env.NODE_EXTRA_CA_CERTS
    });
  }
  if (mtlsConfig) {
    if (mtlsConfig.cert && process.env.CLAUDE_CODE_CLIENT_CERT) {
      properties.push({
        label: t('status.apiProvider.mtlsClientCert'),
        value: process.env.CLAUDE_CODE_CLIENT_CERT
      });
    }
    if (mtlsConfig.key && process.env.CLAUDE_CODE_CLIENT_KEY) {
      properties.push({
        label: t('status.apiProvider.mtlsClientKey'),
        value: process.env.CLAUDE_CODE_CLIENT_KEY
      });
    }
  }
  return properties;
}
export function getModelDisplayLabel(mainLoopModel: string | null): string {
  let modelLabel = modelDisplayString(mainLoopModel);
  if (mainLoopModel === null && isClaudeAISubscriber()) {
    const description = getClaudeAiUserDefaultModelDescription();
    modelLabel = `${chalk.bold('Default')} ${description}`;
  }
  return modelLabel;
}
