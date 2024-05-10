import { CID } from 'multiformats/cid'

import {
  MAX_BLOCK_SIZE,
  isJWS,
  isSignedEvent,
  restrictBlockSize,
} from '../src/utils.js'

describe('utils', () => {
  const TEST_CID = CID.parse(
    'bafyreih7ih3jx5uwwandvhoqyltr4vpl4ra47e4raeaejucdrvk6nl2kui',
  )

  test('isJWS() checks if an object is a JWS', () => {
    expect(isJWS({ foo: 'bar' })).toBe(false)
    expect(isJWS({ payload: 'foo', signatures: [] })).toBe(true)
  })

  test('isSignedEvent() checks if an object is a SignedEvent', () => {
    expect(isSignedEvent({ data: null })).toBe(false)
    expect(isSignedEvent({ jws: 'foo' })).toBe(false)
    expect(isSignedEvent({ jws: { payload: 'foo', signatures: [] } })).toBe(
      true,
    )
  })

  test('restrictBlockSize() throws if the block size exceeds the maximum allowed', () => {
    expect(() => {
      restrictBlockSize(new Uint8Array(MAX_BLOCK_SIZE + 1), TEST_CID)
    }).toThrow(
      'bafyreih7ih3jx5uwwandvhoqyltr4vpl4ra47e4raeaejucdrvk6nl2kui commit size 256001 exceeds the maximum block size of 256000',
    )
    expect(() => {
      restrictBlockSize(new Uint8Array(MAX_BLOCK_SIZE), TEST_CID)
    }).not.toThrow()
  })
})
