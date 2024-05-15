import { StreamID, randomCID } from '@ceramic-sdk/identifiers'
import { type Right, isRight, validate } from 'codeco'

import {
  isStreamIdString,
  streamIdAsString,
  streamIdString,
} from '../src/stream-id.js'

function randomStreamID(): StreamID {
  return new StreamID(0, randomCID())
}

describe('isStreamIdString', () => {
  test('ok', () => {
    expect(isStreamIdString(randomStreamID().toString())).toBe(true)
  })
  test('not ok', () => {
    expect(isStreamIdString(randomCID().toString())).toBe(false)
  })
})

describe('streamIdString', () => {
  const streamId = randomStreamID().toString()
  test('decode: ok', () => {
    const result = validate(streamIdString, streamId)
    expect(isRight(result)).toEqual(true)
    expect((result as unknown as Right<StreamID>).right).toBe(streamId)
  })
  test('decode: not ok', () => {
    const result = validate(streamIdString, 'garbage')
    expect(isRight(result)).toEqual(false)
  })
  test('encode', () => {
    const result = streamIdString.encode(streamId)
    expect(result).toBe(streamId)
  })
})

describe('streamIdAsString', () => {
  const streamId = randomStreamID()
  test('decode: ok', () => {
    const result = validate(streamIdAsString, streamId.toString())
    expect(isRight(result)).toEqual(true)
    expect((result as Right<StreamID>).right).toEqual(streamId)
  })
  test('decode: not ok', () => {
    const result = validate(streamIdAsString, 'garbage')
    expect(isRight(result)).toEqual(false)
  })
  test('encode', () => {
    const result = streamIdAsString.encode(streamId)
    expect(result).toEqual(streamId.toString())
  })
})
