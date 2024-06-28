/**
 * @module key-did
 */

import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver } from 'key-did-resolver'

export function createDID(seed?: Uint8Array): DID {
  const did = new DID({ resolver: getResolver() })
  if (seed != null) {
    did.setProvider(new Ed25519Provider(seed))
  }
  return did
}

export function generatePrivateKey(): Uint8Array {
  return globalThis.crypto.getRandomValues(new Uint8Array(32))
}

export async function getAuthenticatedDID(seed: Uint8Array): Promise<DID> {
  const did = createDID(seed)
  await did.authenticate()
  return did
}
