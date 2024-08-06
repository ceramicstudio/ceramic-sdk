/**
 * @jest-environment ceramic
 * @jest-environment-options {"containerName":"ceramic-test-model","externalPort":5201}
 */

import { SignedEvent, signedEventToCAR } from '@ceramic-sdk/events'
import { createInitEvent } from '@ceramic-sdk/model-client'
import { type Context, handleEvent } from '@ceramic-sdk/model-handler'
import {
  MODEL_STREAM_ID,
  type ModelDefinition,
  ModelEvent,
} from '@ceramic-sdk/model-protocol'
import { getAuthenticatedDID } from '@didtools/key-did'
import 'jest-environment-ceramic'

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

test('create model', async () => {
  await ceramic.client.registerInterestModel(MODEL_STREAM_ID)

  const createdEvent = await createInitEvent(authenticatedDID, testModel)
  const modelCAR = signedEventToCAR(createdEvent)
  const modelCID = modelCAR.roots[0].toString()
  await ceramic.client.postEventType(ModelEvent, createdEvent)

  const feed = await ceramic.client.getEventsFeed()
  const eventID = feed.events[0].id
  expect(eventID).toBe(modelCID)

  const receivedEvent = await ceramic.client.getEventType(SignedEvent, eventID)
  expect(receivedEvent.jws.payload).toBe(createdEvent.jws.payload)

  const state = await handleEvent(eventID, receivedEvent, {
    verifier: authenticatedDID,
  } as unknown as Context)
  expect(state.content).toEqual(testModel)
})
