﻿import { c as _c } from "react/compiler-runtime";
import chalk from 'chalk';
import * as React from 'react';
import { t } from '../../i18n/core.js';
import type { CommandResultDisplay } from '../../commands.js';

import { COMMON_HELP_ARGS, COMMON_INFO_ARGS } from '../../constants/xml.js';
import { type AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS, logEvent } from '../../services/analytics/index.js';
import { useAppState, useSetAppState } from '../../state/AppState.js';
import type { LocalJSXCommandCall, LocalJSXCommandContext } from '../../types/command.js';
import type { ToolUseContext } from '../../Tool.js';
import { isBilledAsExtraUsage } from '../../utils/extraUsage.js';
import { clearFastModeCooldown, isFastModeAvailable, isFastModeEnabled, isFastModeSupportedByModel } from '../../utils/fastMode.js';
import { MODEL_ALIASES } from '../../utils/model/aliases.js';
import { checkOpus1mAccess, checkSonnet1mAccess } from '../../utils/model/check1mAccess.js';
import {
  getActiveProviderConfig,
  getProviderKeyFromConfig,
  readCustomApiStorage,
  writeCustomApiStorage,
  type ProviderAuthMode,
  type ProviderConfig,
} from '../../utils/customApiStorage.js';
import {
  type ReasoningSelection,
} from '../../utils/modelReasoning.js';
import { getDefaultMainLoopModelSetting, isOpus1mMergeEnabled, renderDefaultModelSetting } from '../../utils/model/model.js';
import { getModelOptions } from '../../utils/model/modelOptions.js';
import { isModelAllowed } from '../../utils/model/modelAllowlist.js';
import { validateModel } from '../../utils/model/validateModel.js';
import { tokenCountWithEstimation } from '../../utils/tokens.js';
import { getContextWindowForModel } from '../../utils/context.js';
import { getEffectiveContextWindowSize, getAutoCompactThreshold } from '../../services/compact/autoCompact.js';
import { formatTokens } from '../../utils/format.js';
import { getDetectedModelInfo } from '../../utils/model/contextWindowDetection.js';
import { Box, Text } from '../../ink.js';
import { Select } from '../../components/CustomSelect/index.js';
import { Pane } from '../../components/design-system/Pane.js';

function extractAccountName(baseURL: string | undefined, providerId: string): string {
  if (providerId === 'anthropic-like') {
    return baseURL ? tryExtractHost(baseURL) : t('model.accountName.anthropic');
  }
  if (!baseURL) return providerId === 'gemini-like' ? t('model.accountName.geminiCompatible') : t('model.accountName.openaiCompatible');
  return tryExtractHost(baseURL);
}

function tryExtractHost(url: string): string {
  try {
    const u = new URL(url);
    let host = u.hostname
      .replace(/^api[.-]/, '')
      .replace(/^openai[.-]/, '')
      .replace(/^claude[.-]/, '');
    if (host.includes('.')) {
      const parts = host.split('.');
      host = parts[0];
    }
    return host || url;
  } catch {
    return url;
  }
}

function makeConfiguredOptionValue(
  providerKind: 'anthropic-like' | 'openai-like' | 'gemini-like' | 'glm-like',
  providerId: string,
  baseURL: string | undefined,
  authMode: ProviderAuthMode,
  model: string,
): string {
  return `${providerKind}::${providerId}::${baseURL ?? ''}::${authMode}::${model}`;
}

function isConfiguredProviderValue(value: string): boolean {
  return value.includes('::')
}

const BUILTIN_NO_PREFERENCE = '__NO_PREFERENCE__'

function parseConfiguredOptionValue(value: string): {
  providerKind: 'anthropic-like' | 'openai-like' | 'gemini-like' | 'glm-like';
  providerId: string;
  baseURL: string | undefined;
  authMode: ProviderAuthMode;
  model: string;
} | null {
  const first = value.indexOf('::');
  const second = value.indexOf('::', first + 2);
  const third = value.indexOf('::', second + 2);
  const fourth = value.indexOf('::', third + 2);
  if (first === -1 || second === -1 || third === -1 || fourth === -1) return null;
  const providerKind = value.slice(0, first);
  if (
    providerKind !== 'anthropic-like' &&
    providerKind !== 'openai-like' &&
    providerKind !== 'gemini-like' &&
    providerKind !== 'glm-like'
  ) return null;
  const providerId = value.slice(first + 2, second);
  if (!providerId) return null;
  const baseURL = value.slice(second + 2, third) || undefined;
  const authMode = value.slice(third + 2, fourth);
  if (
    authMode !== 'api-key' &&
    authMode !== 'chat-completions' &&
    authMode !== 'responses' &&
    authMode !== 'oauth' &&
    authMode !== 'vertex-compatible' &&
    authMode !== 'gemini-cli-oauth'
  ) return null;
  const model = value.slice(fourth + 2);
  if (!model) return null;
  return { providerKind, providerId, baseURL, authMode, model };
}

function persistSelectedConfiguredModel(
  value: string | null,
  reasoning?: ReasoningSelection,
): string | null {
  if (!value) {
    return value;
  }
  const parsed = parseConfiguredOptionValue(value);
  if (!parsed) {
    return value;
  }
  const storage = readCustomApiStorage();
  const providers = storage.providers ?? [];
  const providerIndex = providers.findIndex(provider =>
    provider.kind === parsed.providerKind &&
    provider.id === parsed.providerId &&
    (provider.baseURL ?? undefined) === parsed.baseURL &&
    provider.authMode === parsed.authMode &&
    provider.models.includes(parsed.model),
  );
  const providerForModel = providerIndex >= 0 ? providers[providerIndex] : undefined;
  if (!providerForModel) {
    return parsed.model;
  }

  const nextProviders = [...providers];
  if (
    reasoning?.mode === 'openai-chat-completions' ||
    reasoning?.mode === 'openai-responses' ||
    reasoning?.mode === 'openai-codex-oauth'
  ) {
    nextProviders[providerIndex] = {
      ...providerForModel,
      reasoning: {
        ...providerForModel.reasoning,
        reasoningEffort: reasoning.effort,
        ...(reasoning.mode === 'openai-chat-completions'
          ? {}
          : { reasoningSummary: reasoning.summary }),
      },
    };
  }

  writeCustomApiStorage({
    ...storage,
    providers: nextProviders,
    activeProviderKey: getProviderKeyFromConfig(providerForModel),
    activeProvider: providerForModel.id,
    activeModel: parsed.model,
    activeAuthMode: providerForModel.authMode,
    provider:
      providerForModel.kind === 'openai-like'
        ? 'openai'
        : providerForModel.kind === 'gemini-like'
          ? 'gemini'
          : 'anthropic',
    providerKind: providerForModel.kind,
    providerId: providerForModel.id,
    authMode: providerForModel.authMode,
    baseURL: providerForModel.baseURL,
    apiKey: providerForModel.apiKey,
    model: parsed.model,
    savedModels: providerForModel.models,
  });
  if (
    providerForModel.kind === 'gemini-like' &&
    providerForModel.authMode === 'gemini-cli-oauth'
  ) {
    delete process.env.ANTHROPIC_BASE_URL;
    delete process.env.WITCHCAT_API_KEY;
  }
  process.env.ANTHROPIC_MODEL = parsed.model;
  return parsed.model;
}

function formatReasoningMessage(model: string | null, reasoning: ReasoningSelection | undefined): string {
  let message = t('model.setModelTo', { model: chalk.bold(renderModelLabel(model)) });
  if (!reasoning) return message;
  if (reasoning.mode === 'anthropic-effort') {
    return `${message} ${t('model.withEffort', { effort: chalk.bold(reasoning.effort) })}`;
  }
  if (
    reasoning.mode === 'openai-chat-completions' ||
    reasoning.mode === 'openai-responses' ||
    reasoning.mode === 'openai-codex-oauth'
  ) {
    return `${message} ${t('model.withReasoning', { effort: chalk.bold(reasoning.effort) })}`;
  }
  return message;
}

// Helper to get provider display name
function getProviderDisplayName(provider: ProviderConfig): string {
  if (provider.id) return provider.id;
  if (provider.baseURL) return extractAccountName(provider.baseURL, provider.kind);
  return provider.kind === 'anthropic-like' ? 'Anthropic'
    : provider.kind === 'openai-like' ? 'OpenAI Compatible'
    : provider.kind === 'gemini-like' ? 'Gemini Compatible'
    : 'GLM Zhipu';
}

// Helper to get provider icon/emoji
function getProviderIcon(kind: string): string {
  switch (kind) {
    case 'anthropic-like': return '◆';
    case 'openai-like': return '◇';
    case 'gemini-like': return '▲';
    case 'glm-like': return '▼';
    default: return '●';
  }
}

type ProviderSelectOption = {
  value: string;
  label: string;
  description: string;
  provider: ProviderConfig | null; // null = builtin Anthropic
  disabled?: boolean;
};

function getProviderOptions(): ProviderSelectOption[] {
  const storage = readCustomApiStorage();
  const providers = storage.providers ?? [];
  const activeProvider = getActiveProviderConfig(storage);
  const activeProviderKey = activeProvider ? getProviderKeyFromConfig(activeProvider) : 'builtin';

  // Sort providers: active first, then by kind
  const providerOrder = ['anthropic-like', 'openai-like', 'gemini-like', 'glm-like'];
  const sortedProviders = [...providers].sort((a, b) => {
    const aKey = getProviderKeyFromConfig(a);
    const bKey = getProviderKeyFromConfig(b);
    if (aKey === activeProviderKey) return -1;
    if (bKey === activeProviderKey) return 1;
    const orderA = providerOrder.indexOf(a.kind);
    const orderB = providerOrder.indexOf(b.kind);
    return orderA - orderB;
  });

  const result: ProviderSelectOption[] = [];

  // Builtin Anthropic provider (always shown)
  const isBuiltinActive = activeProvider === undefined;
  result.push({
    value: 'builtin',
    label: `${getProviderIcon('anthropic-like')} Anthropic`,
    description: 'Built-in Claude models',
    provider: null,
  });

  // Custom providers
  for (const provider of sortedProviders) {
    const isActive = getProviderKeyFromConfig(provider) === activeProviderKey;
    const icon = getProviderIcon(provider.kind);
    const name = getProviderDisplayName(provider);
    const modelCount = provider.models.length;
    result.push({
      value: getProviderKeyFromConfig(provider),
      label: `${icon} ${name}${isActive ? ' (current)' : ''}`,
      description: `${provider.models.length} model${modelCount > 1 ? 's' : ''} · ${provider.kind.replace('-like', '')}`,
      provider,
    });
  }

  return result;
}

type ModelSelectOption = {
  value: string;
  label: string;
  description: string;
  model: string;
  providerId: string;
  providerKind: 'anthropic-like' | 'openai-like' | 'gemini-like' | 'glm-like';
  authMode: ProviderAuthMode;
  reasoning?: ProviderConfig['reasoning'];
  isCurrent?: boolean;
};

function getModelsForProvider(provider: ProviderConfig | null, fastMode: boolean): ModelSelectOption[] {
  const storage = readCustomApiStorage();
  const activeProvider = getActiveProviderConfig(storage);
  const isBuiltinActive = activeProvider === undefined;
  const activeModel = storage.activeModel ?? storage.model;

  if (provider === null) {
    // Builtin Anthropic models - hardcode standard options to avoid picking up custom models
    const builtinOptions: Array<{ value: string; label: string; description: string }> = [
      { value: 'sonnet', label: 'Sonnet', description: 'Sonnet 4.6 · Best for everyday tasks' },
      { value: 'opus', label: 'Opus', description: 'Opus 4.6 · Most capable for complex work' },
      { value: 'haiku', label: 'Haiku', description: 'Haiku 4.5 · Fastest for quick answers' },
    ];
    // Add 1M context variants if available
    if (process.env.ANTHROPIC_ENABLE_SONNET_1M === 'true' || process.env.ANTHROPIC_ENABLE_SONNET_1M === '1') {
      builtinOptions.splice(1, 0, { value: 'sonnet[1m]', label: 'Sonnet (1M context)', description: 'Sonnet 4.6 with 1M context' });
    }
    if (process.env.ANTHROPIC_ENABLE_OPUS_1M === 'true' || process.env.ANTHROPIC_ENABLE_OPUS_1M === '1') {
      builtinOptions.splice(2, 0, { value: 'opus[1m]', label: 'Opus (1M context)', description: 'Opus 4.6 with 1M context' });
    }
    return builtinOptions.map(opt => ({
      value: opt.value,
      label: opt.label,
      description: opt.description,
      model: opt.value,
      providerId: 'builtin',
      providerKind: 'anthropic-like' as const,
      authMode: 'api-key' as ProviderAuthMode,
      isCurrent: isBuiltinActive && opt.value === activeModel,
    }));
  }

  // Custom provider models
  const providerLabel = provider.kind === 'openai-like'
    ? t('model.providerLabel.openaiCompatible')
    : provider.kind === 'gemini-like'
      ? t('model.providerLabel.geminiCompatible')
      : provider.kind === 'glm-like'
        ? t('model.providerLabel.glmZhipu')
        : t('model.providerLabel.anthropicCompatible');
  const authLabel = provider.authMode === 'api-key'
    ? t('model.authLabel.apiKey')
    : provider.authMode === 'chat-completions'
      ? t('model.authLabel.chatCompletions')
      : provider.authMode === 'responses'
        ? t('model.authLabel.responses')
        : provider.authMode === 'oauth'
          ? t('model.authLabel.oauth')
          : provider.authMode === 'vertex-compatible'
            ? t('model.authLabel.vertexCompatible')
            : provider.authMode === 'gemini-cli-oauth'
              ? t('model.authLabel.geminiCliOauth')
              : provider.kind === 'openai-like'
                ? t('model.authLabel.chatCompletions')
                : provider.kind === 'gemini-like'
                  ? t('model.authLabel.vertexCompatible')
                  : t('model.authLabel.apiKey');

  return provider.models.map(model => {
    const detected = getDetectedModelInfo(model);
    const displayName = detected ? detected.name : model;
    return {
      value: makeConfiguredOptionValue(provider.kind, provider.id, provider.baseURL, provider.authMode, model),
      label: displayName,
      description: `${providerLabel} · ${authLabel}`,
      model,
      providerId: provider.id,
      providerKind: provider.kind,
      authMode: provider.authMode,
      reasoning: provider.reasoning,
      isCurrent:
        provider.kind === storage.providerKind &&
        provider.id === (storage.activeProvider ?? storage.providerId) &&
        (provider.baseURL ?? undefined) === (storage.baseURL ?? undefined) &&
        provider.authMode === (storage.activeAuthMode ?? storage.authMode) &&
        model === storage.activeModel,
    };
  });
}

function ModelPickerWrapper({
  onDone,
}: {
  onDone: (
    result?: string,
    options?: { display?: CommandResultDisplay },
  ) => void
}): React.ReactNode {
  const mainLoopModel = useAppState(s => s.mainLoopModel);
  const mainLoopModelForSession = useAppState(s => s.mainLoopModelForSession);
  const isFastMode = useAppState(s => s.fastMode);
  const setAppState = useSetAppState();

  // Two-level state
  const [level, setLevel] = React.useState<'provider' | 'model'>('provider');
  const [selectedProvider, setSelectedProvider] = React.useState<ProviderConfig | null>(null);

  const storage = readCustomApiStorage();
  const activeProvider = getActiveProviderConfig(storage);
  const currentModelName = storage.activeModel ?? storage.model ?? mainLoopModel;
  const currentModelDisplay = (() => {
    const detected = getDetectedModelInfo(currentModelName);
    return detected ? detected.name : renderModelLabel(currentModelName);
  })();
  const currentProviderName = activeProvider
    ? getProviderDisplayName(activeProvider)
    : 'Anthropic';

  function handleCancel(): void {
    logEvent('tengu_model_command_menu', {
      action: 'cancel' as AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS,
    });
    const displayModel = renderModelLabel(mainLoopModel);
    onDone(t('model.keptModel', { model: chalk.bold(displayModel) }), {
      display: 'system',
    });
  }

  function handleBackToProvider(): void {
    setLevel('provider');
    setSelectedProvider(null);
  }

  function handleProviderSelect(providerKey: string): void {
    const providers = storage.providers ?? [];
    const provider = providerKey === 'builtin'
      ? null
      : providers.find(p => getProviderKeyFromConfig(p) === providerKey) ?? null;
    setSelectedProvider(provider);
    setLevel('model');
  }

  function handleModelSelect(modelValue: string): void {
    if (!modelValue || modelValue === '__NO_PREFERENCE__') {
      setAppState(prev => ({
        ...prev,
        mainLoopModel: null,
        mainLoopModelForSession: null,
      }));
      onDone(t('model.resetToDefault'));
      return;
    }

    let selectedModel: string | null;
    if (isConfiguredProviderValue(modelValue)) {
      selectedModel = persistSelectedConfiguredModel(modelValue) ?? modelValue;
    } else {
      selectedModel = modelValue;
    }

    logEvent('tengu_model_command_menu', {
      action: selectedModel as AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS,
      from_model: mainLoopModel as AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS,
      to_model: selectedModel as AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS,
    });

    setAppState(prev => ({
      ...prev,
      mainLoopModel: selectedModel,
      mainLoopModelForSession: null,
    }));

    let message = t('model.setModelTo', { model: chalk.bold(renderModelLabel(selectedModel)) });

    let wasFastModeToggledOn = undefined;
    if (isFastModeEnabled()) {
      clearFastModeCooldown();
      if (!isFastModeSupportedByModel(selectedModel) && isFastMode) {
        setAppState(prev => ({
          ...prev,
          fastMode: false,
        }));
        wasFastModeToggledOn = false;
      } else if (
        isFastModeSupportedByModel(selectedModel) &&
        isFastModeAvailable() &&
        isFastMode
      ) {
        message += ` · ${t('model.fastModeOn')}`;
        wasFastModeToggledOn = true;
      }
    }

    if (
      isBilledAsExtraUsage(
        selectedModel,
        wasFastModeToggledOn === true,
        isOpus1mMergeEnabled(),
      )
    ) {
      message += ` · ${t('model.billedAsExtraUsage')}`;
    }
    if (wasFastModeToggledOn === false) {
      message += ` · ${t('model.fastModeOff')}`;
    }
    onDone(message);
  }

  // Provider level
  if (level === 'provider') {
    const providerOptions = getProviderOptions();
    const activeProviderKey = activeProvider ? getProviderKeyFromConfig(activeProvider) : 'builtin';
    const defaultValue = activeProviderKey;

    return (
      <Pane color="permission">
        <Box flexDirection="column">
          {/* Current model display - no index */}
          <Box marginBottom={1} flexDirection="column">
            <Text color="remember" bold={true}>{t('modelPicker.selectModel')}</Text>
            <Text dimColor={true}>{t('model.headerText')}</Text>
          </Box>

          <Box marginBottom={1} paddingLeft={1} flexDirection="column">
            <Text color="success" bold={true}>→ {currentModelDisplay}</Text>
            <Text dimColor={true}>  via {currentProviderName}</Text>
          </Box>

          <Box flexDirection="column" marginBottom={1}>
            <Select
              defaultValue={defaultValue}
              options={providerOptions}
              onChange={handleProviderSelect}
              onCancel={handleCancel}
              visibleOptionCount={Math.min(8, providerOptions.length)}
            />
          </Box>

          <Text dimColor={true} italic={true}>
            <Text color="subtle">Enter</Text> select provider · <Text color="subtle">Esc</Text> exit
          </Text>
        </Box>
      </Pane>
    );
  }

  // Model level
  const modelOptions = getModelsForProvider(selectedProvider, isFastMode ?? false);
  const providerName = selectedProvider
    ? getProviderDisplayName(selectedProvider)
    : 'Anthropic';
  const currentModelValue = modelOptions.find(opt => opt.isCurrent)?.value ?? modelOptions[0]?.value;

  return (
    <Pane color="permission">
      <Box flexDirection="column">
        <Box marginBottom={1} flexDirection="column">
          <Text color="remember" bold={true}>{providerName} › {t('modelPicker.selectModel')}</Text>
        </Box>

        <Box flexDirection="column" marginBottom={1}>
          <Select
            defaultValue={currentModelValue}
            options={modelOptions.map(opt => ({
              ...opt,
              label: opt.isCurrent ? `${opt.label} current` : opt.label,
            }))}
            onChange={handleModelSelect}
            onCancel={handleBackToProvider}
            visibleOptionCount={Math.min(8, modelOptions.length)}
          />
        </Box>

        <Text dimColor={true} italic={true}>
          <Text color="subtle">Enter</Text> select model · <Text color="subtle">Esc/←</Text> back
        </Text>
      </Box>
    </Pane>
  );
}

function SetModelAndClose({
  args,
  onDone,
  context,
}: {
  args: string;
  onDone: (result?: string, options?: {
    display?: CommandResultDisplay;
  }) => void;
  context: ToolUseContext & LocalJSXCommandContext;
}): React.ReactNode {
  const isFastMode = useAppState(s => s.fastMode);
  const setAppState = useSetAppState();
  const model = args === 'default' ? null : args;
  React.useEffect(() => {
    async function handleModelChange(): Promise<void> {
      if (model && !isModelAllowed(model)) {
        onDone(t('model.notAvailable', { model }), {
          display: 'system'
        });
        return;
      }

      if (model && isOpus1mUnavailable(model)) {
        onDone(`${t('model.opus1mUnavailable')} ${t('model.learnMore', { url: 'https://code.claude.com/docs/en/model-config#extended-context-with-1m' })}`, {
          display: 'system'
        });
        return;
      }
      if (model && isSonnet1mUnavailable(model)) {
        onDone(`${t('model.sonnet1mUnavailable')} ${t('model.learnMore', { url: 'https://code.claude.com/docs/en/model-config#extended-context-with-1m' })}`, {
          display: 'system'
        });
        return;
      }

      if (!model) {
        setModel(null);
        return;
      }

      if (isKnownAlias(model)) {
        setModel(model);
        return;
      }

      try {
        const {
          valid,
          error: error_0
        } = await validateModel(model);
        if (valid) {
          setModel(model);
        } else {
          onDone(error_0 || t('model.notFound', { model }), {
            display: 'system'
          });
        }
      } catch (error) {
        onDone(t('model.validationFailed', { error: (error as Error).message }), {
          display: 'system'
        });
      }
    }

    /**
     * Check if switching to a model with a smaller context window would
     * cause the current conversation to exceed the new model's capacity.
     * Returns a warning message if there's a problem, or null if safe.
     */
    function checkContextWindowCompatibility(
      targetModel: string,
    ): { safe: true } | { safe: false; warning: string; currentTokens: number; targetWindow: number } {
      const messages = context.messages;
      if (!messages || messages.length === 0) {
        return { safe: true };
      }

      const currentTokenCount = tokenCountWithEstimation(messages);
      const targetContextWindow = getContextWindowForModel(targetModel);
      const targetEffectiveWindow = getEffectiveContextWindowSize(targetModel);
      const targetCompactThreshold = getAutoCompactThreshold(targetModel);

      // If current context is within the new model's effective window, it's safe
      if (currentTokenCount <= targetEffectiveWindow) {
        return { safe: true };
      }

      // Context exceeds the new model's capacity
      const detected = getDetectedModelInfo(targetModel);
      const modelDisplay = detected
        ? `${detected.name} (${formatTokens(detected.contextWindow)} context)`
        : renderModelLabel(targetModel);

      let warning = `⚠️  Context window warning: Current conversation (${formatTokens(currentTokenCount)}) exceeds ${modelDisplay}'s effective capacity (${formatTokens(targetEffectiveWindow)}).`;

      if (currentTokenCount > targetCompactThreshold) {
        warning += `\n   The next message will likely fail with "prompt too long" and trigger emergency compaction, which may lose important context.`;
      }

      warning += `\n   Suggestion: Run /compact first to compress the conversation before switching models.`;

      return {
        safe: false,
        warning,
        currentTokens: currentTokenCount,
        targetWindow: targetContextWindow,
      };
    }

    function setModel(modelValue: string | null): void {
      // Check context window compatibility before switching
      let compatibilityWarning = '';
      if (modelValue) {
        const check = checkContextWindowCompatibility(modelValue);
        if (!check.safe) {
          compatibilityWarning = '\n\n' + check.warning;
        }
      }

      persistSelectedConfiguredModel(modelValue);
      setAppState(prev => ({
        ...prev,
        mainLoopModel: modelValue,
        mainLoopModelForSession: null
      }));
      let message = t('model.setModelTo', { model: chalk.bold(renderModelLabel(modelValue)) });
      let wasFastModeToggledOn = undefined;
      if (isFastModeEnabled()) {
        clearFastModeCooldown();
        if (!isFastModeSupportedByModel(modelValue) && isFastMode) {
          setAppState(prev_0 => ({
            ...prev_0,
            fastMode: false
          }));
          wasFastModeToggledOn = false;
        } else if (isFastModeSupportedByModel(modelValue) && isFastMode) {
          message += ` · ${t('model.fastModeOn')}`;
          wasFastModeToggledOn = true;
        }
      }
      if (isBilledAsExtraUsage(modelValue, wasFastModeToggledOn === true, isOpus1mMergeEnabled())) {
        message += ` · ${t('model.billedAsExtraUsage')}`;
      }
      if (wasFastModeToggledOn === false) {
        message += ` · ${t('model.fastModeOff')}`;
      }

      // Append context window compatibility warning if present
      if (compatibilityWarning) {
        message += compatibilityWarning;
      }

      onDone(message);
    }
    void handleModelChange();
  }, [model, onDone, setAppState, context]);
  return null;
}

function isKnownAlias(model: string): boolean {
  return (MODEL_ALIASES as readonly string[]).includes(model.toLowerCase().trim());
}
function isOpus1mUnavailable(model: string): boolean {
  const m = model.toLowerCase();
  return !checkOpus1mAccess() && !isOpus1mMergeEnabled() && m.includes('opus') && m.includes('[1m]');
}
function isSonnet1mUnavailable(model: string): boolean {
  const m = model.toLowerCase();
  return !checkSonnet1mAccess() && (m.includes('sonnet[1m]') || m.includes('sonnet-4-6[1m]'));
}
function ShowModelAndClose(t0) {
  const {
    onDone
  } = t0;
  const mainLoopModel = useAppState(_temp7);
  const mainLoopModelForSession = useAppState(_temp8);
  const effortValue = useAppState(_temp9);
  const displayModel = renderModelLabel(mainLoopModel);
  const effortInfo = effortValue !== undefined ? ` ${t('model.effortLabel', { effort: effortValue })}` : "";
  if (mainLoopModelForSession) {
    onDone(`${t('model.currentModel', { model: chalk.bold(renderModelLabel(mainLoopModelForSession)) })} ${t('model.sessionOverride')}\n${t('model.baseModel', { model: displayModel })}${effortInfo}`);
  } else {
    onDone(`${t('model.currentModel', { model: displayModel })}${effortInfo}`);
  }
  return null;
}
function _temp9(s_1) {
  return s_1.effortValue;
}
function _temp8(s_0) {
  return s_0.mainLoopModelForSession;
}
function _temp7(s) {
  return s.mainLoopModel;
}
export const call: LocalJSXCommandCall = async (onDone, _context, args) => {
  args = args?.trim() || '';
  if (COMMON_INFO_ARGS.includes(args)) {
    logEvent('tengu_model_command_inline_help', {
      args: args as AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS
    });
    return <ShowModelAndClose onDone={onDone} />;
  }
  if (COMMON_HELP_ARGS.includes(args)) {
    onDone(t('model.helpText'), {
      display: 'system'
    });
    return;
  }
  if (args) {
    logEvent('tengu_model_command_inline', {
      args: args as AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS
    });
    return <SetModelAndClose args={args} onDone={onDone} context={_context} />;
  }
  return <ModelPickerWrapper onDone={onDone} />;
};
function renderModelLabel(model: string | null): string {
  const persistedCustomModel = readCustomApiStorage().model?.trim();
  if (model === null && persistedCustomModel) {
    return persistedCustomModel;
  }
  const rendered = renderDefaultModelSetting(model ?? getDefaultMainLoopModelSetting());
  return model === null ? `${rendered} ${t('model.defaultLabel')}` : rendered;
}
