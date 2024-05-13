import { getAuthenticatedDID } from '@ceramic-sdk/key-did'
import type { EventPayload } from '@ceramic-sdk/types'

import {
  eventFromCAR,
  eventFromString,
  eventToCAR,
  eventToString,
  signedEventToCAR,
  unsignedEventToCAR,
} from '../src/encoding.js'
import { signEvent } from '../src/signing.js'
import { assertSignedEvent, isSignedEvent } from '../src/utils.js'

const did = await getAuthenticatedDID(new Uint8Array(32))

const testEventPayload: EventPayload = {
  data: null,
  header: {
    controllers: [did.id],
    model: new Uint8Array(),
    sep: 'test',
  },
}

test('encode and decode unsigned event as CAR', async () => {
  const encoded = unsignedEventToCAR(testEventPayload)
  const decoded = eventFromCAR(encoded)
  expect(decoded).toEqual(testEventPayload)
})

test('encode and decode signed event as CAR', async () => {
  const event = await signEvent(did, testEventPayload)
  assertSignedEvent(event)
  const encoded = signedEventToCAR(event)
  const decoded = eventFromCAR(encoded)
  assertSignedEvent(decoded)
  expect(decoded).toEqual(event)
})

test('encode and decode any supported event as CAR', async () => {
  const signedEvent = await signEvent(did, testEventPayload)
  const encodedSignedEvent = eventToCAR(signedEvent)
  const decodedSignedEvent = eventFromCAR(encodedSignedEvent)
  assertSignedEvent(decodedSignedEvent)
  expect(decodedSignedEvent).toEqual(signedEvent)

  const encodedEvent = eventToCAR(testEventPayload)
  const decodedEvent = eventFromCAR(encodedEvent)
  expect(isSignedEvent(decodedEvent)).toBe(false)
  expect(decodedEvent).toEqual(testEventPayload)
})

test('encode and decode any supported event as string', async () => {
  const signedEvent = await signEvent(did, testEventPayload)
  const encodedSignedEvent = eventToString(signedEvent)
  const decodedSignedEvent = eventFromString(encodedSignedEvent)
  assertSignedEvent(decodedSignedEvent)
  expect(decodedSignedEvent).toEqual(signedEvent)

  const encodedEvent = eventToString(testEventPayload)
  const decodedEvent = eventFromString(encodedEvent)
  expect(isSignedEvent(decodedEvent)).toBe(false)
  expect(decodedEvent).toEqual(testEventPayload)
})
