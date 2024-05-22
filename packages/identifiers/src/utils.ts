import { CID } from 'multiformats/cid'
import { create } from 'multiformats/hashes/digest'

import { STREAM_TYPES } from './constants.js'
import { StreamID } from './stream-id.js'

export function getCodeByName(name: string): number {
  const index = STREAM_TYPES[name]
  if (index == null) {
    throw new Error(`No stream type registered for name ${name}`)
  }
  return index
}

export function getNameByCode(index: number): string {
  for (const [name, code] of Object.entries(STREAM_TYPES)) {
    if (index === code) {
      return name
    }
  }
  throw new Error(`No stream type registered for index ${index}`)
}

export function randomCID(
  version: 0 | 1 = 1,
  codec = 0x71, // 0x71 is DAG-CBOR codec identifier
  hasher = 0x12, // 0x12 is SHA-256 hashing algorithm
): CID {
  const randomBytes = globalThis.crypto.getRandomValues(new Uint8Array(32))
  return CID.create(version, codec, create(hasher, randomBytes))
}

export function randomStreamID(type: number | string = 0): StreamID {
  return new StreamID(type, randomCID())
}
