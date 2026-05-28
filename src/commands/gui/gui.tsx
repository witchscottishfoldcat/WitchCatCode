import * as React from 'react'
import type { LocalJSXCommandCall } from '../../types/command.js'
import { GuiLauncher } from './GuiLauncher.js'

export const call: LocalJSXCommandCall = async (onDone, context) => {
  return <GuiLauncher onDone={onDone} context={context} />
}
