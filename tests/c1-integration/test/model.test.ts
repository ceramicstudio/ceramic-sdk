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
import withContainer from '@databases/with-container'

const startContainer = withContainer.default as typeof withContainer

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

let client: CeramicClient
let runningContainer: Awaited<ReturnType<typeof startContainer>>

beforeAll(async () => {
  runningContainer = await startContainer({
    debug: true,
    image: 'public.ecr.aws/r5b3e0r5/3box/ceramic-one:latest',
    containerName: 'ceramic-one-model',
    internalPort: 5001,
    defaultExternalPort: 5001,
    connectTimeoutSeconds: 10,
    environment: {
      CERAMIC_ONE_BIND_ADDRESS: '0.0.0.0:5001',
      CERAMIC_ONE_LOG_FORMAT: 'single-line',
      CERAMIC_ONE_NETWORK: 'in-memory',
      CERAMIC_ONE_STORE_DIR: '/',
    },
  })
  client = new CeramicClient({
    url: `http://localhost:${runningContainer.externalPort}`,
  })
}, 60000)

afterAll(async () => {
  await runningContainer?.kill()
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
