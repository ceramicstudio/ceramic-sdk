import { EthereumDID } from '@ceramic-sdk/ethereum-did'
import {
  type SignedEvent,
  createSignedEvent,
  signEvent,
} from '@ceramic-sdk/events'
import { createDID, getAuthenticatedDID } from '@ceramic-sdk/key-did'
import {
  MODEL,
  MODEL_RESOURCE_URI,
  type ModelDefinition,
  type ModelDefinitionV2,
  type ModelInitEventPayload,
  getModelStreamID,
} from '@ceramic-sdk/model-protocol'
import { asDIDString } from '@didtools/codecs'
import { jest } from '@jest/globals'
import type { DID } from 'dids'

import { handleInitEvent } from '../src/handler.js'
import type { Context } from '../src/types.js'

const authenticatedDID = await getAuthenticatedDID(new Uint8Array(32))

const defaultContext: Context = {
  loadModelDefinition: () => {
    throw new Error('Not implemented')
  },
  verifier: createDID(),
}

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
  return await createSignedEvent(did, definition, {
    model: MODEL,
    sep: 'model',
  })
}

const validEvent = await createModelEvent(authenticatedDID)

describe('handleInitEvent()', () => {
  test('verifies the signed event', async () => {
    await expect(
      handleInitEvent(validEvent, defaultContext),
    ).resolves.not.toThrow()

    // Chaning the event payload should make the signature check fail
    const invalidEvent = {
      ...validEvent,
      jws: { ...validEvent.jws, payload: 'changed' },
    }
    await expect(async () => {
      await handleInitEvent(invalidEvent, defaultContext)
    }).rejects.toThrow('invalid_signature: Signature invalid for JWT')
  })

  describe('validates the controller', () => {
    test('supports did:key', async () => {
      expect(authenticatedDID.id.startsWith('did:key')).toBe(true)
      await expect(
        handleInitEvent(validEvent, defaultContext),
      ).resolves.not.toThrow()
    })

    test('supports did:pkh', async () => {
      const did = await EthereumDID.random({
        domain: 'test',
        resources: [MODEL_RESOURCE_URI],
      })

      const [validEvent, invalidEvent] = await Promise.all([
        did
          .createSession({ expirationTime: null })
          .then((session) => createModelEvent(session.did)),
        did
          .createSession({ expiresInSecs: 60 })
          .then((session) => createModelEvent(session.did)),
      ])

      await expect(async () => {
        await handleInitEvent(invalidEvent, defaultContext)
      }).rejects.toThrow(
        'Invalid CACAO: Model Streams do not support CACAOs with expiration times',
      )

      await expect(
        handleInitEvent(validEvent, defaultContext),
      ).resolves.not.toThrow()
    })
  })

  test('validates the content', async () => {
    // @ts-expect-error
    const invalidDefinition: ModelDefinition = { ...testModelV1, version: '0' }
    const event = await createModelEvent(authenticatedDID, invalidDefinition)
    await expect(async () => {
      await handleInitEvent(event, defaultContext)
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
      await handleInitEvent(event, defaultContext)
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

    const loadModelDefinition = jest.fn(() => Promise.resolve(interfaceModel))
    const context = { loadModelDefinition, verifier: authenticatedDID }

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
      await handleInitEvent(event, context)
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
    expect(loadModelDefinition).toHaveBeenCalledTimes(2)

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
    await expect(handleInitEvent(event, context)).resolves.not.toThrow()
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
    const [event, streamID] = await Promise.all([
      signEvent(authenticatedDID, payload),
      getModelStreamID(payload),
    ])

    const state = await handleInitEvent(event, defaultContext)
    expect(state.id).toBe(streamID.toString())
    expect(state.content).toEqual(testModelV1)
    expect(state.metadata.controller).toBe(authenticatedDID.id)
    expect(state.metadata.model.equals(MODEL)).toBe(true)
    expect(state.log[0]).toBe(event)
  })
})
