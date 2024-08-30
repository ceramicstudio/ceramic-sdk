import type { AuthMethod } from '@didtools/cacao'
import type { EIP1193Provider, Hex } from 'viem'
import { generatePrivateKey } from 'viem/accounts'

import { createProvider, getAccount } from './ethereum/provider.js'
import { createAuthMethod } from './ethereum/siwe.js'

// Default private key used for tests
const PRIVATE_KEY =
  '0xe50df915de22bad5bf1abf43f78b55d64640afdcdfa6b1699a514d97662b23f7' as Hex

// Re-exports from viem
export { generatePrivateKey }
export type { EIP1193Provider, Hex }

// Re-exports useful internals
export { createAuthMethod, createProvider, getAccount }

export async function authMethodFromProvider(
  provider: EIP1193Provider,
): Promise<AuthMethod> {
  const accountId = await getAccount(provider)
  return createAuthMethod(provider, accountId) as AuthMethod
}

export async function authMethodFromPrivateKey(
  privateKey: Hex,
): Promise<AuthMethod> {
  const provider = createProvider(privateKey)
  return await authMethodFromProvider(provider)
}

export async function authMethodFromRandomKey(): Promise<AuthMethod> {
  return await authMethodFromPrivateKey(generatePrivateKey())
}

export async function getAuthMethod(): Promise<AuthMethod> {
  return await authMethodFromPrivateKey(PRIVATE_KEY)
}
