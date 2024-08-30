import type { AuthMethod } from '@didtools/cacao'
import { DIDSession } from 'did-session'

import type { AuthOptions } from './types.js'

export type { DIDSession }

export async function createSession(
  authMethod: AuthMethod,
  options: AuthOptions,
): Promise<DIDSession> {
  return await DIDSession.authorize(
    authMethod,
    options as Omit<AuthOptions, 'expirationTime'>,
  )
}
