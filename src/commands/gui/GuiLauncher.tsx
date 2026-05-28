import * as React from 'react'
import { Box, Text } from '../../ink.js'
import { t } from '../../i18n/core.js'
import type { LocalJSXCommandContext } from '../../types/command.js'
import { startGuiServer } from '../../gui/server/index.js'

type Props = {
  onDone: () => void
  context: LocalJSXCommandContext
}

export function GuiLauncher({ onDone }: Props) {
  const [state, setState] = React.useState<'starting' | 'ready' | 'error'>('starting')
  const [url, setUrl] = React.useState<string>('')
  const [errMsg, setErrMsg] = React.useState<string>('')

  React.useEffect(() => {
    let mounted = true
    startGuiServer()
      .then(result => {
        if (!mounted) return
        setUrl(result.url)
        setState('ready')
      })
      .catch(err => {
        if (!mounted) return
        setErrMsg(err instanceof Error ? err.message : String(err))
        setState('error')
      })
    return () => { mounted = false }
  }, [])

  if (state === 'starting') {
    return (
      <Box flexDirection="column" paddingX={1} paddingY={1}>
        <Text bold>{t('gui.launcher.starting')}</Text>
      </Box>
    )
  }

  if (state === 'error') {
    return (
      <Box flexDirection="column" paddingX={1} paddingY={1}>
        <Text bold color="red">{t('gui.launcher.error')}</Text>
        <Text color="red">{errMsg}</Text>
        <Box marginTop={1}>
          <Text dimColor>{t('gui.launcher.pressToExit')}</Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box flexDirection="column" paddingX={1} paddingY={1}>
      <Text bold color="green">{t('gui.launcher.ready')}</Text>
      <Box marginTop={1}>
        <Text>{t('gui.launcher.url')}: </Text>
        <Text bold color="cyan">{url}</Text>
      </Box>
      <Box marginTop={1}>
        <Text dimColor>{t('gui.launcher.hint')}</Text>
      </Box>
    </Box>
  )
}
