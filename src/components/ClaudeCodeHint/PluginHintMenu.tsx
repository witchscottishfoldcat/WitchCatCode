import * as React from 'react';
import { Box, Text } from '../../ink.js';
import { useI18n } from '../../hooks/useI18n.js';
import { Select } from '../CustomSelect/select.js';
import { PermissionDialog } from '../permissions/PermissionDialog.js';
type Props = {
  pluginName: string;
  pluginDescription?: string;
  marketplaceName: string;
  sourceCommand: string;
  onResponse: (response: 'yes' | 'no' | 'disable') => void;
};
const AUTO_DISMISS_MS = 30_000;
export function PluginHintMenu({
  pluginName,
  pluginDescription,
  marketplaceName,
  sourceCommand,
  onResponse
}: Props): React.ReactNode {
  const { t } = useI18n();
  const onResponseRef = React.useRef(onResponse);
  onResponseRef.current = onResponse;
  React.useEffect(() => {
    const timeoutId = setTimeout(ref => ref.current('no'), AUTO_DISMISS_MS, onResponseRef);
    return () => clearTimeout(timeoutId);
  }, []);
  function onSelect(value: string): void {
    switch (value) {
      case 'yes':
        onResponse('yes');
        break;
      case 'disable':
        onResponse('disable');
        break;
      default:
        onResponse('no');
    }
  }
  const options = [{
    label: <Text>
          {t('pluginHint.yesInstall')} <Text bold>{pluginName}</Text>
        </Text>,
    value: 'yes'
  }, {
    label: t('pluginHint.no'),
    value: 'no'
  }, {
    label: t('pluginHint.noDontShowAgain'),
    value: 'disable'
  }];
  return <PermissionDialog title={t('pluginHint.title')}>
      <Box flexDirection="column" paddingX={2} paddingY={1}>
        <Box marginBottom={1}>
          <Text dimColor>
            {t('pluginHint.commandSuggests', { command: sourceCommand })}
          </Text>
        </Box>
        <Box>
          <Text dimColor>{t('pluginHint.plugin')}:</Text>
          <Text> {pluginName}</Text>
        </Box>
        <Box>
          <Text dimColor>{t('pluginHint.marketplace')}:</Text>
          <Text> {marketplaceName}</Text>
        </Box>
        {pluginDescription && <Box>
            <Text dimColor>{pluginDescription}</Text>
          </Box>}
        <Box marginTop={1}>
          <Text>{t('pluginHint.wouldYouLike')}</Text>
        </Box>
        <Box>
          <Select options={options} onChange={onSelect} onCancel={() => onResponse('no')} />
        </Box>
      </Box>
    </PermissionDialog>;
}
