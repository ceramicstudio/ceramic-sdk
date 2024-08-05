import { assertSignedEvent } from '@ceramic-sdk/events'
import {
  MODEL_RESOURCE_URI,
  type ModelDefinition,
} from '@ceramic-sdk/model-protocol'
import { EthereumDID } from '@ceramic-sdk/test-utils'
import { getAuthenticatedDID } from '@didtools/key-did'

import { createInitEvent } from '../src/index.js'

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

describe('createInitEvent()', () => {
  test('validates the content', async () => {
    // @ts-expect-error
    const invalidDefinition: ModelDefinition = { ...testModelV1, version: '0' }
    await expect(async () => {
      await createInitEvent(authenticatedDID, invalidDefinition)
    }).rejects.toThrow('Unsupported version format: 0')
  })

  describe('validates the controller', () => {
    test('supports did:key', async () => {
      expect(authenticatedDID.id.startsWith('did:key')).toBe(true)
      await expect(
        createInitEvent(authenticatedDID, testModelV1),
      ).resolves.not.toThrow()
    })

    test('supports did:pkh', async () => {
      const did = await EthereumDID.random({
        domain: 'test',
        resources: [MODEL_RESOURCE_URI],
      })

      const [validSession, invalidSession] = await Promise.all([
        did.createSession({ expirationTime: null }),
        did.createSession({ expiresInSecs: 60 }),
      ])

      await expect(async () => {
        await createInitEvent(invalidSession.did, testModelV1)
      }).rejects.toThrow(
        'Invalid CACAO: Model Streams do not support CACAOs with expiration times',
      )

      await expect(
        createInitEvent(validSession.did, testModelV1),
      ).resolves.not.toThrow()
    })
  })

  test('returns the signed event', async () => {
    const event = await createInitEvent(authenticatedDID, testModelV1)
    assertSignedEvent(event)
  })
})
