import { randomStreamID } from '@ceramic-sdk/identifiers'
import type { ModelDefinitionV2 } from '@ceramic-sdk/model-protocol'
import { jest } from '@jest/globals'

import type { Context, DocumentSnapshot } from '../src/types.js'
import {
  validateRelation,
  validateRelationsContent,
} from '../src/validation.js'

describe('validateRelation()', () => {
  test('validates with exact model match', async () => {
    const loadDocument = jest.fn(() => {
      return {
        content: {},
        metadata: { model: 'modelID' },
      } as unknown as DocumentSnapshot
    })
    const context = { loadDocument } as unknown as Context

    await expect(
      validateRelation(context, 'docID', 'modelID', 'foo'),
    ).resolves.not.toThrow()
    expect(loadDocument).toHaveBeenCalledWith('docID')
  })

  test('validates with model implementing the expected interface', async () => {
    const loadDocument = jest.fn(() => {
      return {
        content: {},
        metadata: { model: 'modelID' },
      } as unknown as DocumentSnapshot
    })
    const loadModelDefinition = jest.fn(() => {
      return {
        implements: ['interfaceID'],
      } as unknown as ModelDefinitionV2
    })
    const context = { loadDocument, loadModelDefinition } as unknown as Context

    await expect(
      validateRelation(context, 'docID', 'interfaceID', 'foo'),
    ).resolves.not.toThrow()
    expect(loadDocument).toHaveBeenCalledWith('docID')
    expect(loadModelDefinition).toHaveBeenCalledWith('modelID')
  })

  test('throws if the relation does not match the expected model', async () => {
    const loadDocument = jest.fn(() => {
      return {
        content: {},
        metadata: { model: 'modelID' },
      } as unknown as DocumentSnapshot
    })
    const loadModelDefinition = jest.fn(() => {
      return {
        name: 'TestModel',
        implements: [],
      } as unknown as ModelDefinitionV2
    })
    const context = { loadDocument, loadModelDefinition } as unknown as Context

    await expect(
      validateRelation(context, 'docID', 'interfaceID', 'foo'),
    ).rejects.toThrow(
      "Relation on field foo points to Stream docID, which belongs to Model modelID, but this Stream's Model (TestModel) specifies that this relation must be to a Stream in the Model interfaceID",
    )
    expect(loadDocument).toHaveBeenCalledWith('docID')
    expect(loadModelDefinition).toHaveBeenCalledWith('modelID')
  })
})

describe('validateRelationsContent()', () => {
  test('throws if a document relation value is not a valid StreamID', async () => {
    const context = {} as unknown as Context
    const model = {
      name: 'TestModel',
      relations: {
        link: { type: 'document' },
      },
    } as unknown as ModelDefinitionV2

    await expect(async () => {
      await validateRelationsContent(context, model, {
        link: 'invalidStreamID',
      })
    }).rejects.toThrow(
      'Error while parsing relation from field link: Invalid StreamID: Unable to decode multibase string "invalidStreamID", base36 decoder only supports inputs prefixed with k',
    )
  })

  test('throws if an unknown relation type is used', async () => {
    const context = {} as unknown as Context
    const model = {
      name: 'TestModel',
      relations: {
        link: { type: 'unknown' },
      },
    } as unknown as ModelDefinitionV2

    await expect(async () => {
      await validateRelationsContent(context, model, {
        link: randomStreamID().toString(),
      })
    }).rejects.toThrow('Unknown relation type')
  })

  test('ignores account relations and empty document relations', async () => {
    const context = {} as unknown as Context
    const model = {
      name: 'TestModel',
      relations: {
        foo: { type: 'account' },
        bar: { type: 'document', model: null },
      },
    } as unknown as ModelDefinitionV2

    await expect(
      validateRelationsContent(context, model, {}),
    ).resolves.not.toThrow()
  })

  test('validates all relations', async () => {
    const docID = randomStreamID().toString()
    const modelID = randomStreamID().toString()
    const interfaceID = randomStreamID().toString()

    const loadDocument = jest.fn(() => {
      return {
        content: {},
        metadata: { model: modelID },
      } as unknown as DocumentSnapshot
    })
    const loadModelDefinition = jest.fn(() => {
      return {
        implements: [interfaceID],
      } as unknown as ModelDefinitionV2
    })
    const context = { loadDocument, loadModelDefinition } as unknown as Context

    const model = {
      name: 'TestModel',
      relations: {
        foo: { type: 'document', model: modelID },
        bar: { type: 'document', model: interfaceID },
      },
    } as unknown as ModelDefinitionV2

    await expect(
      validateRelationsContent(context, model, {
        foo: docID,
        bar: docID,
      }),
    ).resolves.not.toThrow()
    expect(loadDocument).toHaveBeenCalledTimes(2)
    expect(loadModelDefinition).toHaveBeenCalledTimes(1)
  })
})
