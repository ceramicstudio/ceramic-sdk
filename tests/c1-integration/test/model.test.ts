import { SignedEvent, signedEventToCAR } from '@ceramic-sdk/events'
import { CeramicClient } from '@ceramic-sdk/http-client'
import { getAuthenticatedDID } from '@ceramic-sdk/key-did'
import { createInitEvent } from '@ceramic-sdk/model-client'
import { type Context, handleEvent } from '@ceramic-sdk/model-handler'
import {
  MODEL_STREAM_ID,
  type ModelDefinition,
  ModelEvent,
} from '@ceramic-sdk/model-protocol'

const client = new CeramicClient({ url: 'http://localhost:5001' })

const authenticatedDID = await getAuthenticatedDID(new Uint8Array(32))

const testModel: ModelDefinition = {
  version: '1.0',
  name: 'TestModel',
  description: 'Test model',
  accountRelation: { type: 'list' },
  schema: {
    type: 'object',
    properties: {
      test: { type: 'string', maxLength: 10 },
    },
    additionalProperties: false,
  },
}

test.only('connect to ceramic-one', async () => {
  const res = await fetch('http://localhost:5001/ceramic/version')
  expect(res.ok)
  const data = await res.json()
  console.log('version', data.version)
})

test('create model', async () => {
  await client.registerInterestModel(MODEL_STREAM_ID)

  const createdEvent = await createInitEvent(authenticatedDID, testModel)
  const modelCAR = signedEventToCAR(createdEvent)
  const modelCID = modelCAR.roots[0].toString()
  await client.postEventType(ModelEvent, createdEvent)

  const feed = await client.getEventsFeed()
  const eventID = feed.events[0].id
  expect(eventID).toBe(modelCID)

  const receivedEvent = await client.getEventType(SignedEvent, eventID)
  expect(receivedEvent.jws.payload).toBe(createdEvent.jws.payload)

  const state = await handleEvent(eventID, receivedEvent, {
    verifier: authenticatedDID,
  } as unknown as Context)
  expect(state.content).toEqual(testModel)
})
