import { SignedEvent } from '@ceramic-sdk/events'
import { CeramicClient } from '@ceramic-sdk/http-client'
import { getAuthenticatedDID } from '@ceramic-sdk/key-did'
import { createInitEvent } from '@ceramic-sdk/model-client'
import {
  MODEL_STREAM_ID,
  type ModelDefinition,
  ModelEvent,
} from '@ceramic-sdk/model-protocol'

const client = new CeramicClient({ url: 'http://localhost:5001' })

const authenticatedDID = await getAuthenticatedDID(new Uint8Array(32))

const testModelV1: ModelDefinition = {
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

test('create model', async () => {
  await client.registerInterestModel(MODEL_STREAM_ID)
  const createdEvent = await createInitEvent(authenticatedDID, testModelV1)
  await client.postEventType(ModelEvent, createdEvent)
  const feed = await client.getEventsFeed()
  const receivedEvent = await client.getEventType(
    SignedEvent,
    feed.events[0].id,
  )
  expect(receivedEvent.jws.payload).toBe(createdEvent.jws.payload)
})
