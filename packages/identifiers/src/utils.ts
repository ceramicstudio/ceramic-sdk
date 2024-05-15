import { CID } from 'multiformats/cid'
import { create } from 'multiformats/hashes/digest'

export function randomCID(
  version: 0 | 1 = 1,
  codec = 0x71, // 0x71 is DAG-CBOR codec identifier
  hasher = 0x12, // 0x12 is SHA-256 hashing algorithm
): CID {
  const randomBytes = globalThis.crypto.getRandomValues(new Uint8Array(32))
  return CID.create(version, codec, create(hasher, randomBytes))
}
