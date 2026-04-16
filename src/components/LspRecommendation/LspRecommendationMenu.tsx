import * as React from 'react';
import { Box, Text } from '../../ink.js';
import { useI18n } from '../../hooks/useI18n.js';
import { Select } from '../CustomSelect/select.js';
import { PermissionDialog } from '../permissions/PermissionDialog.js';
type Props = {
  pluginName: string;
  pluginDescription?: string;
  fileExtension: string;
  onResponse: (response: 'yes' | 'no' | 'never' | 'disable') => void;
};
const AUTO_DISMISS_MS = 30_000;
export function LspRecommendationMenu({
  pluginName,
  pluginDescription,
  fileExtension,
  onResponse
}: Props): React.ReactNode {
  const { t } = useI18n();
  // Use ref to avoid timer reset when onResponse changes
  const onResponseRef = React.useRef(onResponse);
  onResponseRef.current = onResponse;

  // 30-second auto-dismiss timer - counts as ignored (no)
  React.useEffect(() => {
    const timeoutId = setTimeout(ref => ref.current('no'), AUTO_DISMISS_MS, onResponseRef);
    return () => clearTimeout(timeoutId);
  }, []);
  function onSelect(value: string): void {
    switch (value) {
      case 'yes':
        onResponse('yes');
        break;
      case 'no':
        onResponse('no');
        break;
      case 'never':
        onResponse('never');
        break;
      case 'disable':
        onResponse('disable');
        break;
    }
  }
  const options = [{
    label: <Text>
          {t('lspRecommendation.yesInstall')} <Text bold>{pluginName}</Text>
        </Text>,
    value: 'yes'
  }, {
    label: t('lspRecommendation.noNotNow'),
    value: 'no'
  }, {
    label: <Text>
          {t('lspRecommendation.neverFor')} <Text bold>{pluginName}</Text>
        </Text>,
    value: 'never'
  }, {
    label: t('lspRecommendation.disableAll'),
    value: 'disable'
  }];
  return <PermissionDialog title={t('lspRecommendation.title')}>
      <Box flexDirection="column" paddingX={2} paddingY={1}>
        <Box marginBottom={1}>
          <Text dimColor>
            {t('lspRecommendation.description')}
          </Text>
        </Box>
        <Box>
          <Text dimColor>{t('lspRecommendation.plugin')}:</Text>
          <Text> {pluginName}</Text>
        </Box>
        {pluginDescription && <Box>
            <Text dimColor>{pluginDescription}</Text>
          </Box>}
        <Box>
          <Text dimColor>{t('lspRecommendation.triggeredBy')}:</Text>
          <Text> {fileExtension} {t('lspRecommendation.files')}</Text>
        </Box>
        <Box marginTop={1}>
          <Text>{t('lspRecommendation.wouldYouLike')}</Text>
        </Box>
        <Box>
          <Select options={options} onChange={onSelect} onCancel={() => onResponse('no')} />
        </Box>
      </Box>
    </PermissionDialog>;
}
