import type { CID } from 'multiformats/cid'
import { toString as bytesToString, fromString } from 'uint8arrays'

export const MAX_BLOCK_SIZE = 256000 // 256 KB

export function base64urlToJSON<T = Record<string, unknown>>(value: string): T {
  return JSON.parse(bytesToString(fromString(value, 'base64url')))
}

/**
 * Restricts block size to MAX_BLOCK_SIZE.
 *
 * @param block - Uint8Array of IPLD block
 * @param cid - Commit CID
 */
export function restrictBlockSize(block: Uint8Array, cid: CID): void {
  const size = block.byteLength
  if (size > MAX_BLOCK_SIZE) {
    throw new Error(
      `${cid} commit size ${size} exceeds the maximum block size of ${MAX_BLOCK_SIZE}`,
    )
  }
}
