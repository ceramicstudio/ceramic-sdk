import type { DagJWS, SignedEvent } from '@ceramic-sdk/types'
import type { CID } from 'multiformats/cid'
import { toString as bytesToString, fromString } from 'uint8arrays'

const IPFS_MAX_COMMIT_SIZE = 256000 // 256 KB

export function base64urlToJSON<T = Record<string, unknown>>(value: string): T {
  return JSON.parse(bytesToString(fromString(value, 'base64url')))
}

export function isJWS(data: unknown): data is DagJWS {
  return (
    data != null &&
    typeof (data as DagJWS).payload === 'string' &&
    Array.isArray((data as DagJWS).signatures)
  )
}

export function isSignedEvent(event: unknown): event is SignedEvent {
  return event != null && (event as SignedEvent).jws != null
}

/**
 * Restricts block size to +IPFS_MAX_COMMIT_SIZE+.
 *
 * @param block - Uint8Array of IPLD block
 * @param cid - Commit CID
 */
export function restrictBlockSize(block: Uint8Array, cid: CID): void {
  const size = block.byteLength
  if (size > IPFS_MAX_COMMIT_SIZE) {
    throw new Error(
      `${cid} commit size ${size} exceeds the maximum block size of ${IPFS_MAX_COMMIT_SIZE}`,
    )
  }
}
