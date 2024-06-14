import {
  createInitEvent,
  getDeterministicInitEvent,
} from '@ceramic-sdk/document-client'
import { randomStreamID } from '@ceramic-sdk/identifiers'
import { getAuthenticatedDID } from '@ceramic-sdk/key-did'
import type { ModelDefinitionV2 } from '@ceramic-sdk/model-protocol'
import { jest } from '@jest/globals'

import { handleInitEvent } from '../src/handlers.js'
import type { Context } from '../src/types.js'

const authenticatedDID = await getAuthenticatedDID(new Uint8Array(32))

describe('handleInitEvent()', () => {
  test('handles signed events', async () => {
    const modelID = randomStreamID()

    const loadModelDefinition = jest.fn(() => {
      return {
        accountRelation: { type: 'list' },
        schema: {
          type: 'object',
          properties: { hello: { type: 'string' } },
          required: ['hello'],
        },
      } as unknown as ModelDefinitionV2
    })
    const context = {
      loadModelDefinition,
      verifier: authenticatedDID,
    } as unknown as Context

    const event = await createInitEvent({
      controller: authenticatedDID,
      model: modelID,
      content: { hello: 'world' },
    })
    const handled = await handleInitEvent(event, context)

    expect(handled.id).toBeDefined()
    expect(handled.content).toStrictEqual({ hello: 'world' })
    expect(handled.metadata).toStrictEqual({
      controller: authenticatedDID.id,
      model: modelID.toString(),
      unique: expect.any(String),
    })
    expect(handled.log).toEqual([event])
  })

  test('handles deterministic events', async () => {
    const modelID = randomStreamID()

    const loadModelDefinition = jest.fn(() => {
      return {
        accountRelation: { type: 'single' },
        schema: {
          type: 'object',
          properties: { hello: { type: 'string' } },
          required: ['hello'],
        },
      } as unknown as ModelDefinitionV2
    })
    const context = { loadModelDefinition } as unknown as Context

    const event = getDeterministicInitEvent(modelID, 'did:key:123')
    const handled = await handleInitEvent(event, context)

    expect(handled.id).toBeDefined()
    expect(handled.content).toBeNull()
    expect(handled.metadata).toStrictEqual({
      controller: 'did:key:123',
      model: modelID.toString(),
    })
    expect(handled.log).toEqual([event])
  })
})
