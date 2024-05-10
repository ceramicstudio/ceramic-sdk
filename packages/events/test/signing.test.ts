import { createDID, getAuthenticatedDID } from '@ceramic-sdk/key-did'
import type { EventHeader } from '@ceramic-sdk/types'

import {
  type PartialEventHeader,
  createSignedEvent,
  getSignedEventPayload,
  signEvent,
} from '../src/signing.js'
import { assertSignedEvent } from '../src/utils.js'

const authenticatedDID = await getAuthenticatedDID(new Uint8Array(32))

const defaultHeader: PartialEventHeader = { model: new Uint8Array() }

test('signEvent() signs the given event payload', async () => {
  const event = await signEvent(authenticatedDID, {
    data: null,
    header: {
      controllers: [authenticatedDID.id],
      model: new Uint8Array(),
      sep: 'test',
    },
  })
  assertSignedEvent(event)
})

test.todo('getSignedEventPayload()')

test.todo('verifyEvent()')

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
      controllers: ['did:test:123'],
      model: new Uint8Array([1, 2, 3]),
      sep: 'foo',
      unique: new Uint8Array([4, 5, 6]),
    }
    const event = await createSignedEvent(authenticatedDID, null, header)
    const payload = await getSignedEventPayload(event)
    expect(payload.header).toEqual(header)
  })
})
