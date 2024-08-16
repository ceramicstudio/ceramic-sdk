import {
  type KeyPairSigner,
  createSignableMessage,
  createSignerFromKeyPair,
} from '@solana/signers'
import { AccountId } from 'caip'

import { getEd25519KeyPair } from './webcrypto.ts'

// Value from RPC call - https://solana.com/docs/rpc/http/getgenesishash#code-sample
const DEVNET_GENESIS_HASH = 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG'

export async function getSigner(): Promise<KeyPairSigner> {
  const keyPair = await getEd25519KeyPair()
  return await createSignerFromKeyPair(keyPair)
}

export function getAccountId(signer: KeyPairSigner): AccountId {
  return new AccountId({
    address: signer.address,
    chainId: `solana:${DEVNET_GENESIS_HASH}`,
  })
}

// From @didtools/pkh-solana
export type SolanaProvider = {
  signMessage: (
    message: Uint8Array,
    type: string,
  ) => Promise<{ signature: Uint8Array }>
}

export function getProvider(signer: KeyPairSigner): SolanaProvider {
  async function signMessage(message: Uint8Array) {
    const signable = createSignableMessage(message)
    const [signatureDict] = await signer.signMessages([signable])
    const signature = signatureDict[signer.address]
    return { signature }
  }
  return { signMessage }
}
