import { createInitEvent as createDocument } from '@ceramic-sdk/document-client'
import { DocumentEvent } from '@ceramic-sdk/document-protocol'
import { SignedEvent, signedEventToCAR } from '@ceramic-sdk/events'
import { CeramicClient } from '@ceramic-sdk/http-client'
import { StreamID } from '@ceramic-sdk/identifiers'
import { getAuthenticatedDID } from '@ceramic-sdk/key-did'
import { createInitEvent as createModel } from '@ceramic-sdk/model-client'
import {
  type ModelState,
  handleInitEvent as handleModel,
} from '@ceramic-sdk/model-handler'
import {
  type ModelDefinition,
  getModelStreamID,
} from '@ceramic-sdk/model-protocol'
import withContainer from '@databases/with-container'

const startContainer = withContainer.default as typeof withContainer

const authenticatedDID = await getAuthenticatedDID(new Uint8Array(32))

const testModel: ModelDefinition = {
  version: '2.0',
  name: 'TestModel',
  description: 'Test model',
  accountRelation: { type: 'list' },
  interface: false,
  implements: [],
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
    containerName: 'ceramic-one-document',
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

test('create model and documents using the model', async () => {
  const modelsStore: Record<string, ModelState> = {}

  const context = {
    getModelDefinition: async (id) => {
      const cid = StreamID.fromString(id).cid.toString()
      const state = modelsStore[cid]
      if (state == null) {
        throw new Error(`State not found for model: ${id}`)
      }
      return state.content
    },
    verifier: authenticatedDID,
  }

  const modelEvent = await createModel(authenticatedDID, testModel)
  const modelCID = signedEventToCAR(modelEvent).roots[0]
  const modelCIDstring = modelCID.toString()
  modelsStore[modelCIDstring] = await handleModel(
    modelCIDstring,
    modelEvent,
    context,
  )

  await client.registerInterestModel(modelCIDstring)

  async function postEvent(event: DocumentEvent): Promise<void> {
    await client.postEventType(DocumentEvent, event)
  }

  // TODO: create and post documents
  const model = getModelStreamID(modelCID)
  await Promise.all([
    createDocument({
      controller: authenticatedDID,
      content: { test: 'one' },
      model,
    }).then(postEvent),
    createDocument({
      controller: authenticatedDID,
      content: { test: 'two' },
      model,
    }).then(postEvent),
  ])

  const feed = await client.getEventsFeed()
  console.log('feed', feed)
  expect(feed.events).toHaveLength(2)
  // const receivedEvent = await client.getEventType(
  //   SignedEvent,
  //   feed.events[0].id,
  // )
})
