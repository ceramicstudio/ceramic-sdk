import { assertSignedEvent, getSignedEventPayload } from '@ceramic-sdk/events'
import { CommitID, randomCID, randomStreamID } from '@ceramic-sdk/identifiers'
import {
  DataInitEventPayload,
  DocumentDataEventPayload,
} from '@ceramic-sdk/model-instance-protocol'
import { getAuthenticatedDID } from '@didtools/key-did'
import { equals } from 'uint8arrays'

import {
  createDataEvent,
  createInitEvent,
  getDeterministicInitEvent,
  getDeterministicInitEventPayload,
} from '../src/index.js'

const authenticatedDID = await getAuthenticatedDID(new Uint8Array(32))

describe('getDeterministicInitEventPayload()', () => {
  test('returns the deterministic event payload without unique value by default', () => {
    const model = randomStreamID()
    const event = getDeterministicInitEventPayload(model, 'did:key:123')
    expect(event.data).toBeNull()
    expect(event.header.controllers).toEqual(['did:key:123'])
    expect(event.header.model).toBe(model)
    expect(event.header.unique).toBeUndefined()
  })

  test('returns the deterministic event payload with the provided unique value', () => {
    const model = randomStreamID()
    const unique = new Uint8Array([0, 1, 2])
    const event = getDeterministicInitEventPayload(model, 'did:key:123', unique)
    expect(event.data).toBeNull()
    expect(event.header.controllers).toEqual(['did:key:123'])
    expect(event.header.model).toBe(model)
    expect(event.header.unique).toBe(unique)
  })
})

describe('getDeterministicInitEvent()', () => {
  test('returns the deterministic event without unique value by default', () => {
    const model = randomStreamID()
    const event = getDeterministicInitEvent(model, 'did:key:123')
    expect(event.data).toBeNull()
    expect(event.header.controllers).toEqual(['did:key:123'])
    expect(equals(event.header.model, model.bytes)).toBe(true)
    expect(event.header.unique).toBeUndefined()
  })

  test('returns the deterministic event with the provided unique value', () => {
    const model = randomStreamID()
    const unique = new Uint8Array([0, 1, 2])
    const event = getDeterministicInitEvent(model, 'did:key:123', unique)
    expect(event.data).toBeNull()
    expect(event.header.controllers).toEqual(['did:key:123'])
    expect(equals(event.header.model, model.bytes)).toBe(true)
    expect(event.header.unique).toBe(unique)
  })
})

describe('createInitEvent()', () => {
  test('creates unique events by adding a random unique value', async () => {
    const model = randomStreamID()
    const event1 = await createInitEvent({
      content: { hello: 'world' },
      controller: authenticatedDID,
      model,
    })
    assertSignedEvent(event1)

    const event2 = await createInitEvent({
      content: { hello: 'world' },
      controller: authenticatedDID,
      model,
    })
    expect(event2).not.toEqual(event1)
  })

  test('adds the context and shouldIndex when if provided', async () => {
    const model = randomStreamID()
    const event1 = await createInitEvent({
      content: { hello: 'world' },
      controller: authenticatedDID,
      model,
    })
    const payload1 = await getSignedEventPayload(DataInitEventPayload, event1)
    expect(payload1.header.context).toBeUndefined()
    expect(payload1.header.shouldIndex).toBeUndefined()

    const context = randomStreamID()
    const event2 = await createInitEvent({
      content: { hello: 'world' },
      controller: authenticatedDID,
      model,
      context,
      shouldIndex: true,
    })
    const payload2 = await getSignedEventPayload(DataInitEventPayload, event2)
    expect(payload2.header.context?.equals(context)).toBe(true)
    expect(payload2.header.shouldIndex).toBe(true)
  })
})

describe('createDataEvent()', () => {
  const commitID = CommitID.fromStream(randomStreamID(), randomCID())

  test('creates the JSON patch payload', async () => {
    const event = await createDataEvent({
      controller: authenticatedDID,
      currentID: commitID,
      currentContent: { hello: 'test' },
      newContent: { hello: 'world', test: true },
    })
    const payload = await getSignedEventPayload(DocumentDataEventPayload, event)
    expect(payload.data).toEqual([
      { op: 'replace', path: '/hello', value: 'world' },
      { op: 'add', path: '/test', value: true },
    ])
    expect(payload.header).toBeUndefined()
  })

  test('adds the shouldIndex header when provided', async () => {
    const event = await createDataEvent({
      controller: authenticatedDID,
      currentID: commitID,
      newContent: { hello: 'world' },
      shouldIndex: true,
    })
    const payload = await getSignedEventPayload(DocumentDataEventPayload, event)
    expect(payload.header).toEqual({ shouldIndex: true })
  })
})
