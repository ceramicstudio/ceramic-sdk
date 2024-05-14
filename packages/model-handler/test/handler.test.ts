import { EthereumDID } from '@ceramic-sdk/ethereum-did'
import { createSignedEvent } from '@ceramic-sdk/events'
import { createDID, getAuthenticatedDID } from '@ceramic-sdk/key-did'
import {
  MODEL,
  MODEL_RESOURCE_URI,
  type ModelDefinition,
} from '@ceramic-sdk/model-protocol'
import type { DID, SignedEvent } from '@ceramic-sdk/types'

import { handleInitEvent } from '../src/handler.js'
import type { Context } from '../src/types.js'

const authenticatedDID = await getAuthenticatedDID(new Uint8Array(32))

const defaultContext: Context = {
  loadModel: () => {
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

async function createModelEvent(
  did: DID,
  definition: ModelDefinition = testModelV1,
): Promise<SignedEvent> {
  return await await createSignedEvent(did, definition, { model: MODEL.bytes })
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
      }).rejects.toThrow('Invalid CACAO: no expiry date should be set')

      await expect(
        handleInitEvent(validEvent, defaultContext),
      ).resolves.not.toThrow()
    })
  })

  test.todo('validates the content')

  test.todo('validates interfaces')

  test.todo('validates interface implementations')

  test.todo('validates interfaces')

  test.todo('returns the created stream state')
})
