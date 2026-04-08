import { homedir } from 'os'
import { join } from 'path'

export function getWitchcatConfigDir(): string {
  return process.env.WITCHCAT_CONFIG_DIR ?? join(homedir(), '.witchcat')
}

export function getWitchcatGlobalConfigFile(): string {
  return join(getWitchcatConfigDir(), '.claude.json')
}
