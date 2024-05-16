import { randomStreamID } from '@ceramic-sdk/identifiers'
import { createDID, getAuthenticatedDID } from '@ceramic-sdk/key-did'
import { asDIDString } from '@didtools/codecs'

import {
  type EventHeader,
  type EventPayload,
  assertSignedEvent,
} from '../src/codecs.js'
import {
  type PartialEventHeader,
  createSignedEvent,
  getSignedEventPayload,
  signEvent,
  verifyEvent,
} from '../src/signing.js'

const authenticatedDID = await getAuthenticatedDID(new Uint8Array(32))

const defaultHeader: PartialEventHeader = {
  model: randomStreamID(),
  sep: 'model',
}

const testEventPayload: EventPayload = {
  data: null,
  header: {
    controllers: [asDIDString(authenticatedDID.id)],
    model: randomStreamID(),
    sep: 'test',
  },
}

test('signEvent() signs the given event payload', async () => {
  const event = await signEvent(authenticatedDID, testEventPayload)
  assertSignedEvent(event)
})

test('getSignedEventPayload() returns the EventPayload of a SignedEvent', async () => {
  const signed = await signEvent(authenticatedDID, testEventPayload)
  const event = await getSignedEventPayload(signed)
  expect(event).toEqual(testEventPayload)
})

test('verifyEvent() verifies the signed event signature and extract the payload', async () => {
  const signed = await signEvent(authenticatedDID, testEventPayload)
  const verified = await verifyEvent(authenticatedDID, signed)
  expect(verified.didResolutionResult).toBeDefined()
  expect(verified.kid).toBeDefined()
  expect(verified).toMatchObject(testEventPayload)
})

describe('createSignedEvent()', () => {
  test('authenticates the DID', async () => {
    await expect(async () => {
      await createSignedEvent(createDID(), null, defaultHeader)
    }).rejects.toThrow('No provider available')

    const event = await createSignedEvent(authenticatedDID, null, defaultHeader)
    assertSignedEvent(event)
  })

  test('fills the header values', async () => {
    const event = await createSignedEvent(authenticatedDID, null, defaultHeader)
    const payload = await getSignedEventPayload(event)
    expect(payload.header).toEqual({
      ...defaultHeader,
      controllers: [authenticatedDID.id],
      sep: 'model',
    })
  })

  test('uses the provided values', async () => {
    const header: EventHeader = {
      controllers: [asDIDString('did:test:123')],
      model: randomStreamID(),
      sep: 'foo',
      unique: new Uint8Array([4, 5, 6]),
    }
    const event = await createSignedEvent(authenticatedDID, null, header)
    const payload = await getSignedEventPayload(event)
    expect(payload.header).toEqual(header)
  })
})
