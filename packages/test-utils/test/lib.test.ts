import { Cacao } from '@didtools/cacao'
import { getEIP191Verifier } from '@didtools/pkh-ethereum'
import { DIDSession } from 'did-session'

import { createSession, ethereum } from '../src/index.js'
import type { AuthOptions } from '../src/types.js'

const defaultOptions: AuthOptions = {
  domain: 'test',
  resources: ['test'],
}

describe('Sessions', () => {
  test('createSession() method creates a DIDSession', async () => {
    const authMethod = await ethereum.authMethodFromRandomKey()
    const session1 = await createSession(authMethod, defaultOptions)
    expect(session1).toBeInstanceOf(DIDSession)
    const session2 = await createSession(authMethod, defaultOptions)
    expect(session2.id).toBe(session1.id)
    expect(session2.did.id).not.toBe(session1.did.id)
  })

  test('Session signing can be verified', async () => {
    const authMethod = await ethereum.authMethodFromRandomKey()
    const session = await createSession(authMethod, defaultOptions)
    expect(session.id).toBe(session.did.parent)

    const result = await session.did.createDagJWS({ test: true })
    // biome-ignore lint/style/noNonNullAssertion: existing value
    const capability = await Cacao.fromBlockBytes(result.cacaoBlock!)
    const verified = await session.did.verifyJWS(result.jws, {
      capability,
      issuer: session.id,
      verifiers: getEIP191Verifier(),
    })
    expect(verified).toBeDefined()
  })
})
