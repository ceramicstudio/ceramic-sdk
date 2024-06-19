import {
  createInitHeader,
  getDeterministicInitEventPayload,
} from '@ceramic-sdk/document-client'
import { randomCID, randomStreamID } from '@ceramic-sdk/identifiers'
import { getAuthenticatedDID } from '@ceramic-sdk/key-did'
import type { ModelDefinitionV2 } from '@ceramic-sdk/model-protocol'
import { jest } from '@jest/globals'

import {
  handleDeterministicInitPayload,
  handleInitPayload,
} from '../src/handlers.js'
import type { Context } from '../src/types.js'

const authenticatedDID = await getAuthenticatedDID(new Uint8Array(32))

test('handleDeterministicInitPayload()', async () => {
  const cid = randomCID()
  const modelID = randomStreamID()

  const getModelDefinition = jest.fn(() => {
    return {
      accountRelation: { type: 'single' },
      schema: {
        type: 'object',
        properties: { hello: { type: 'string' } },
        required: ['hello'],
      },
    } as unknown as ModelDefinitionV2
  })
  const context = { getModelDefinition } as unknown as Context

  const event = getDeterministicInitEventPayload(modelID, 'did:key:123')
  const handled = await handleDeterministicInitPayload(cid, event, context)

  expect(handled.cid).toBe(cid)
  expect(handled.content).toBeNull()
  expect(handled.metadata.controller).toBe('did:key:123')
  expect(handled.metadata.model.equals(modelID)).toBe(true)
  expect(handled.log).toEqual([event])
})

test('handleInitPayload()', async () => {
  const cid = randomCID()
  const modelID = randomStreamID()

  const getModelDefinition = jest.fn(() => {
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
    getModelDefinition,
    verifier: authenticatedDID,
  } as unknown as Context

  const payload = {
    data: { hello: 'world' },
    header: createInitHeader({
      controller: authenticatedDID.id,
      model: modelID,
    }),
  }
  const handled = await handleInitPayload(cid, payload, context)
  expect(handled.cid).toBe(cid)
  expect(handled.content).toStrictEqual({ hello: 'world' })
  expect(handled.metadata.controller).toBe(authenticatedDID.id)
  expect(handled.metadata.model.equals(modelID)).toBe(true)
  expect(handled.metadata.unique).toBeInstanceOf(Uint8Array)
  expect(handled.log).toEqual([payload])
})
