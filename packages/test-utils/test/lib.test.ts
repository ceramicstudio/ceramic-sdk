import { DIDSession } from 'did-session'
import { privateKeyToAccount } from 'viem/accounts'

import { EthereumDID, generatePrivateKey } from '../src/index.js'
import { createProvider, getAccount } from '../src/provider.js'
import { createAuthMethod } from '../src/siwe.js'
import type { AuthOptions } from '../src/types.js'

const defaultOptions: AuthOptions = {
  domain: 'test',
  resources: ['test'],
}

test('EthereumDID.fromProvider() creates the EthereumDID instance using the provider', async () => {
  const privateKey = generatePrivateKey()
  const did = await EthereumDID.fromProvider(
    createProvider(privateKey),
    defaultOptions,
  )
  expect(did).toBeInstanceOf(EthereumDID)
  const address = privateKeyToAccount(privateKey).address.toLowerCase()
  expect(did.id).toBe(`did:pkh:eip155:1:${address}`)
})

test('EthereumDID.fromPrivateKey() creates the EthereumDID instance using the private key', async () => {
  const privateKey = generatePrivateKey()
  const did = await EthereumDID.fromPrivateKey(privateKey, defaultOptions)
  expect(did).toBeInstanceOf(EthereumDID)
  const address = privateKeyToAccount(privateKey).address.toLowerCase()
  expect(did.id).toBe(`did:pkh:eip155:1:${address}`)
})

describe('EthereumDID', () => {
  test('constructor throws if no resource is provided', async () => {
    const provider = createProvider(generatePrivateKey())
    const accountId = await getAccount(provider)
    const authMethod = await createAuthMethod(provider, accountId)
    expect(() => {
      new EthereumDID({
        accountId,
        authMethod,
        authOptions: { domain: 'test', resources: [] },
      })
    }).toThrow(
      'The "resources" array of the authorization options must contain at least one item',
    )
  })

  test('createSession() method creates a DIDSession', async () => {
    const factory = await EthereumDID.random(defaultOptions)
    const session1 = await factory.createSession()
    expect(session1).toBeInstanceOf(DIDSession)
    expect(session1.id).toBe(factory.id)
    const session2 = await factory.createSession()
    expect(session2.id).toBe(factory.id)
    expect(session2.did.id).not.toBe(session1.did.id)
  })
})
