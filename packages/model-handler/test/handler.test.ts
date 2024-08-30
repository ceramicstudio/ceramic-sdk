import {
  type SignedEvent,
  type TimeEvent,
  createSignedInitEvent,
  signEvent,
} from '@ceramic-sdk/events'
import { randomCID } from '@ceramic-sdk/identifiers'
import {
  MODEL,
  MODEL_RESOURCE_URI,
  MODEL_STREAM_ID,
  type ModelDefinition,
  type ModelDefinitionV2,
  type ModelEvent,
  ModelInitEventPayload,
} from '@ceramic-sdk/model-protocol'
import { createSession, ethereum } from '@ceramic-sdk/test-utils'
import { asDIDString } from '@didtools/codecs'
import { createDID, getAuthenticatedDID } from '@didtools/key-did'
import { jest } from '@jest/globals'
import type { DID } from 'dids'

import {
  handleEvent,
  handleInitEvent,
  handleTimeEvent,
} from '../src/handler.js'
import type { Context, InitContext, ModelState } from '../src/types.js'

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

const testInterfaceModel: ModelDefinitionV2 = {
  version: '2.0',
  name: 'TestInterface',
  description: 'Test interface',
  accountRelation: { type: 'none' },
  interface: true,
  implements: [],
  schema: {
    type: 'object',
    properties: {
      test: { type: 'string', maxLength: 10 },
    },
    additionalProperties: false,
  },
}

async function createModelEvent(
  did: DID,
  definition: ModelDefinition = testModelV1,
): Promise<SignedEvent> {
  return await createSignedInitEvent(did, definition, {
    model: MODEL,
    sep: 'model',
  })
}

const validEvent = await createModelEvent(authenticatedDID)

describe('handleInitEvent()', () => {
  const cid = randomCID().toString()

  const defaultContext: InitContext = {
    getModelDefinition: () => {
      throw new Error('Not implemented')
    },
    verifier: createDID(),
  }

  test('verifies the signed event', async () => {
    await expect(
      handleInitEvent(cid, validEvent, defaultContext),
    ).resolves.not.toThrow()

    // Chaning the event payload should make the signature check fail
    const invalidEvent = {
      ...validEvent,
      jws: { ...validEvent.jws, payload: 'changed' },
    }
    await expect(async () => {
      await handleInitEvent(cid, invalidEvent, defaultContext)
    }).rejects.toThrow('invalid_signature: Signature invalid for JWT')
  })

  describe('validates the controller', () => {
    test('supports did:key', async () => {
      expect(authenticatedDID.id.startsWith('did:key')).toBe(true)
      await expect(
        handleInitEvent(cid, validEvent, defaultContext),
      ).resolves.not.toThrow()
    })

    test('supports did:pkh', async () => {
      const authMethod = await ethereum.authMethodFromRandomKey()

      const [validEvent, invalidEvent] = await Promise.all([
        createSession(authMethod, {
          domain: 'test',
          resources: [MODEL_RESOURCE_URI],
          expirationTime: null,
        }).then((session) => createModelEvent(session.did)),
        createSession(authMethod, {
          domain: 'test',
          resources: [MODEL_RESOURCE_URI],
          expiresInSecs: 60,
        }).then((session) => createModelEvent(session.did)),
      ])

      await expect(async () => {
        await handleInitEvent(cid, invalidEvent, defaultContext)
      }).rejects.toThrow(
        'Invalid CACAO: Model Streams do not support CACAOs with expiration times',
      )

      await expect(
        handleInitEvent(cid, validEvent, defaultContext),
      ).resolves.not.toThrow()
    })
  })

  test('validates the content', async () => {
    // @ts-expect-error
    const invalidDefinition: ModelDefinition = { ...testModelV1, version: '0' }
    const event = await createModelEvent(authenticatedDID, invalidDefinition)
    await expect(async () => {
      await handleInitEvent(cid, event, defaultContext)
    }).rejects.toThrow('Invalid value "0"')
  })

  test('validates interfaces', async () => {
    const invalidInterface = {
      ...testInterfaceModel,
      schema: { type: 'object', properties: {}, additionalProperties: false },
    }
    // @ts-expect-error
    const event = await createModelEvent(authenticatedDID, invalidInterface)
    await expect(async () => {
      await handleInitEvent(cid, event, defaultContext)
    }).rejects.toThrow(
      'Invalid interface: a least one propery or view must be present',
    )
  })

  test('validates interface implementations', async () => {
    const MODEL_ID_1 =
      'kjzl6hvfrbw6c5ykyyjq0v80od0nhdimprq7j2pccg1l100ktiiqcc01ddka001'
    const MODEL_ID_2 =
      'kjzl6hvfrbw6c5ykyyjq0v80od0nhdimprq7j2pccg1l100ktiiqcc01ddka002'

    const interfaceModel: ModelDefinitionV2 = {
      version: '2.0',
      name: 'ExpectedModel',
      accountRelation: { type: 'none' },
      interface: true,
      implements: [],
      schema: {
        type: 'object',
        properties: { foo: { type: 'string' } },
        additionalProperties: false,
      },
      relations: {
        foo: { type: 'account' },
      },
      views: {
        bar: { type: 'documentAccount' },
      },
      immutableFields: ['foo'],
    }

    const getModelDefinition = jest.fn(() => Promise.resolve(interfaceModel))
    const context = { getModelDefinition, verifier: authenticatedDID }

    try {
      const event = await createModelEvent(authenticatedDID, {
        version: '2.0',
        name: 'MyModel',
        accountRelation: { type: 'list' },
        interface: false,
        implements: [MODEL_ID_1, MODEL_ID_2],
        schema: {
          type: 'object',
          properties: { foo: { type: 'string' } },
          additionalProperties: false,
        },
        immutableFields: [],
      })
      await handleInitEvent(cid, event, context)
    } catch (error) {
      expect(error.errors).toHaveLength(2)
      const model1Errors = error.errors[0].errors
      expect(model1Errors).toHaveLength(3)
      expect(model1Errors[0].toString()).toBe(
        `Error: Invalid relations implementation of interface ${MODEL_ID_1}`,
      )
      expect(model1Errors[1].toString()).toBe(
        `Error: Invalid views implementation of interface ${MODEL_ID_1}`,
      )
      expect(model1Errors[2].toString()).toBe(
        `Error: Invalid immutable fields implementation of interface ${MODEL_ID_1}`,
      )
    }
    expect(getModelDefinition).toHaveBeenCalledTimes(2)

    const event = await createModelEvent(authenticatedDID, {
      version: '2.0',
      name: 'MyModel',
      accountRelation: { type: 'list' },
      interface: false,
      implements: [MODEL_ID_1, MODEL_ID_2],
      schema: {
        type: 'object',
        properties: { foo: { type: 'string' } },
        additionalProperties: false,
      },
      relations: {
        foo: { type: 'account' },
      },
      views: {
        bar: { type: 'documentAccount' },
      },
      immutableFields: ['foo'],
    })
    await expect(handleInitEvent(cid, event, context)).resolves.not.toThrow()
  })

  test('returns the created stream state', async () => {
    const payload: ModelInitEventPayload = {
      data: testModelV1,
      header: {
        controllers: [asDIDString(authenticatedDID.id)],
        model: MODEL,
        sep: 'model',
      },
    }

    const event = await signEvent(
      authenticatedDID,
      ModelInitEventPayload.encode(payload),
    )
    const state = await handleInitEvent(cid, event, defaultContext)
    expect(state.content).toEqual(testModelV1)
    expect(state.metadata.controller).toBe(authenticatedDID.id)
    expect(state.metadata.model).toBe(MODEL_STREAM_ID)
    expect(state.log).toEqual([cid])
  })
})

describe('handleTimeEvent()', () => {
  const eventCID = randomCID().toString()
  const modelCID = randomCID()
  const modelCIDString = modelCID.toString()

  test('throws if the existing state log is empty', async () => {
    const getModelState = jest.fn(() => {
      return Promise.resolve({ log: [] } as unknown as ModelState)
    })
    const context = { getModelState }
    const event = { id: modelCID } as unknown as TimeEvent
    await expect(async () => {
      await handleTimeEvent(eventCID, event, context)
    }).rejects.toThrow(
      `Invalid model state provided for time event ${eventCID}: log is empty`,
    )
  })

  test('throws if the loaded state does not match the expected model', async () => {
    const otherModelCID = randomCID().toString()
    const getModelState = jest.fn(() => {
      return Promise.resolve({ log: [otherModelCID] } as unknown as ModelState)
    })
    const context = { getModelState }
    const event = { id: modelCID } as unknown as TimeEvent
    await expect(async () => {
      await handleTimeEvent(eventCID, event, context)
    }).rejects.toThrow(
      `Invalid state with model ${otherModelCID} provided for time event ${eventCID}: expected model ${modelCID}`,
    )
  })

  test('throws if the event prev ID does not match the loaded state init ID', async () => {
    const getModelState = jest.fn(() => {
      return Promise.resolve({ log: [modelCIDString] } as unknown as ModelState)
    })
    const context = { getModelState }
    const prevCID = randomCID()
    const event = { id: modelCID, prev: prevCID } as TimeEvent
    await expect(async () => {
      await handleTimeEvent(eventCID, event, context)
    }).rejects.toThrow(
      `Invalid time event ${eventCID}: expected prev to be ${modelCID} but got ${prevCID}`,
    )
  })

  test('adds the time event to the log', async () => {
    const getModelState = jest.fn(() => {
      return Promise.resolve({ log: [modelCIDString] } as unknown as ModelState)
    })
    const context = { getModelState }
    const event = { id: modelCID, prev: modelCID } as TimeEvent
    await expect(handleTimeEvent(eventCID, event, context)).resolves.toEqual({
      log: [modelCIDString, eventCID],
    })
  })
})

describe('handleEvent()', () => {
  const eventCID = randomCID().toString()
  const modelCID = randomCID()

  test('handles signed and time events', async () => {
    let state: ModelState = {} as ModelState
    const getModelState = jest.fn(() => {
      return Promise.resolve(state)
    })
    const context = {
      getModelDefinition: () => {
        throw new Error('Not implemented')
      },
      getModelState,
      verifier: createDID(),
    }

    // Handle init event first to get state
    state = await handleEvent(modelCID.toString(), validEvent, context)

    // Handle time event
    const timeEvent = {
      id: modelCID,
      prev: modelCID,
      proof: randomCID(),
      path: '/',
    }
    const updatedState = await handleEvent(eventCID, timeEvent, context)

    expect(updatedState.content).toBe(state.content)
    expect(updatedState.metadata).toBe(state.metadata)
    expect(updatedState.log).toEqual([modelCID.toString(), eventCID])
  })

  test('throws if the event is not supported', async () => {
    await expect(async () => {
      await handleEvent(
        eventCID,
        {} as unknown as ModelEvent,
        {} as unknown as Context,
      )
    }).rejects.toThrow(`Unsupported event: ${eventCID}`)
  })
})
