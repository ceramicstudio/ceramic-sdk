import {
  type AuthMethod,
  type AuthMethodOpts,
  Cacao,
  SiweMessage,
  type SiwxMessage,
} from '@didtools/cacao'
import { bytesToHex } from '@noble/hashes/utils'
import type { AccountId } from 'caip'
import type { Address, EIP1193Provider, Hex } from 'viem'

/**
 * SIWX Version
 */
const VERSION = '1'

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000

function randomNonce(): string {
  return bytesToHex(globalThis.crypto.getRandomValues(new Uint8Array(10)))
}

export async function createCACAO(
  provider: EIP1193Provider,
  account: AccountId,
  options: AuthMethodOpts,
): Promise<Cacao> {
  const now = new Date()

  const message: Partial<SiwxMessage> = {
    domain: options.domain,
    address: account.address,
    statement:
      options.statement ??
      'Give this application access to some of your data on Ceramic',
    uri: options.uri,
    version: VERSION,
    nonce: options.nonce ?? randomNonce(),
    issuedAt: now.toISOString(),
    chainId: account.chainId.reference,
    resources: options.resources,
  }
  // Only add expirationTime if not explicitly set to null
  if (options.expirationTime !== null) {
    message.expirationTime =
      options.expirationTime ?? new Date(now.getTime() + ONE_WEEK).toISOString()
  }

  const siweMessage = new SiweMessage(message)
  const signature = await provider.request({
    method: 'personal_sign',
    params: [
      siweMessage.signMessage({ eip55: true }) as Hex,
      account.address as Address,
    ],
  })
  siweMessage.signature = signature

  return Cacao.fromSiweMessage(siweMessage)
}

export function createAuthMethod(
  provider: EIP1193Provider,
  account: AccountId,
): AuthMethod {
  return (options: AuthMethodOpts) => {
    return createCACAO(provider, account, options)
  }
}
