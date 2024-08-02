import { type Cacao, CacaoBlock } from '@didtools/cacao'
import type { JSONSchema } from 'json-schema-typed/draft-2020-12'

import {
  assertValidCacao,
  assertValidSchema,
  assertValidSetFields,
  validateController,
} from '../src/assertions.js'
import { MODEL_RESOURCE_URI } from '../src/constants.js'

const validCacao = {
  p: { iss: 'did:pkh:123', resources: [MODEL_RESOURCE_URI] },
} as unknown as Cacao

describe('assertValidCacao()', () => {
  test('passes the expected checks', () => {
    assertValidCacao(validCacao, 'did:pkh:123')
    assertValidCacao(
      {
        p: { iss: 'did:pkh:123', resources: ['some', 'other', 'ceramic://*'] },
      } as unknown as Cacao,
      'did:pkh:123',
    )
  })

  test('checks the CACAO issuer is the expected controller', () => {
    expect(() => {
      assertValidCacao(
        { p: { iss: 'did:pkh:123' } } as unknown as Cacao,
        'did:test:456',
      )
    }).toThrow(
      'Invalid CACAO: issuer did:pkh:123 does not match controller did:test:456',
    )
  })

  test('checks the CACAO does not expire', () => {
    expect(() => {
      assertValidCacao(
        {
          p: { iss: 'did:pkh:123', exp: new Date().toISOString() },
        } as unknown as Cacao,
        'did:pkh:123',
      )
    }).toThrow(
      'Invalid CACAO: Model Streams do not support CACAOs with expiration times',
    )
  })

  test('checks the CACAO contains the Model resource', () => {
    expect(() => {
      assertValidCacao(
        {
          p: { iss: 'did:pkh:123', resources: ['ceramic://test'] },
        } as unknown as Cacao,
        'did:pkh:123',
      )
    }).toThrow(`Invalid CACAO: missing resource "${MODEL_RESOURCE_URI}"`)
  })
})

describe('assertValidSchema()', () => {
  const VALID_JSON_SCHEMA_2020_12_NO_ADDITIONAL_PROPS = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: {
      stringPropName: {
        type: 'string',
        maxLength: 80,
      },
      objectPropName: {
        $ref: '#/$defs/EmbeddedObject',
      },
    },
    $defs: {
      EmbeddedObject: {
        type: 'object',
        properties: {
          stringPropName: {
            type: 'string',
            maxLength: 80,
          },
        },
        additionalProperties: false,
      },
    },
    additionalProperties: false,
    required: ['stringPropName'],
  } satisfies JSONSchema.Object

  it('validates correct 2020-12 schema', () => {
    expect(() => {
      assertValidSchema(VALID_JSON_SCHEMA_2020_12_NO_ADDITIONAL_PROPS)
    }).not.toThrow()
  })

  it('throws for correct 2020-12 schema with `additionalProperties === true` enabled on top-level', () => {
    const validSchemaAllowingAdditionalProps = {
      ...VALID_JSON_SCHEMA_2020_12_NO_ADDITIONAL_PROPS,
      additionalProperties: true,
    }
    expect(() => {
      assertValidSchema(validSchemaAllowingAdditionalProps)
    }).toThrow(
      'All objects in schema need to have additional properties disabled',
    )
  })

  it('throws for correct 2020-12 schema with `additionalProperties === <allowed_property_type>` enabled on top-level', () => {
    const validSchemaAllowingAdditionalStringProps = {
      ...VALID_JSON_SCHEMA_2020_12_NO_ADDITIONAL_PROPS,
      additionalProperties: { type: 'string' },
    }

    expect(() => {
      assertValidSchema(validSchemaAllowingAdditionalStringProps)
    }).toThrow(
      'All objects in schema need to have additional properties disabled',
    )
  })

  it('throws for correct 2020-12 schema with `additionalProperties === true` in one of the $defs objects', () => {
    const validSchemaAllowingAdditionalPropsInEmbeddedObj = {
      ...VALID_JSON_SCHEMA_2020_12_NO_ADDITIONAL_PROPS,
      $defs: {
        EmbeddedObject: {
          ...VALID_JSON_SCHEMA_2020_12_NO_ADDITIONAL_PROPS.$defs.EmbeddedObject,
          additionalProperties: true,
        },
      },
    }

    expect(() => {
      assertValidSchema(validSchemaAllowingAdditionalPropsInEmbeddedObj)
    }).toThrow(
      'All objects in schema need to have additional properties disabled',
    )
  })

  it('throws for an incorrect 2020-12 schema', () => {
    expect(() => {
      assertValidSchema({
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        type: 'object',
        properties: {
          stringPropName: {
            type: 'CLEARLY_A_WRONG_TYPE',
          },
        },
        $defs: ['$DEFS_SHOULD_BE_AN_OBJECT'],
        additionalProperties: false,
        required: 'THIS_SHOULD_BE_AN_ARRAY_OF_STRINGS',
      })
    }).toThrow(
      'Validation Error: data/$defs must be object, data/properties/stringPropName/type must be equal to one of the allowed values, data/properties/stringPropName/type must be array, data/properties/stringPropName/type must match a schema in anyOf, data/required must be array',
    )
  })
})

describe('assertValidSetFields()', () => {
  test('throws if no fields are defined', () => {
    expect(() => {
      assertValidSetFields([], { type: 'object' })
    }).toThrow(
      'At least one field must be defined for the SET account relation',
    )
  })

  test('throws if a field is missing', () => {
    let error: Error = new Error('Test failed')
    try {
      assertValidSetFields(['one', 'two'], {
        type: 'object',
        properties: { one: { type: 'string' } },
        required: ['one', 'two'],
      })
    } catch (err) {
      error = err
    }
    expect(error.message).toBe('Invalid schema fields for SET account relation')
    expect(error.errors[0].message).toBe('Field not found in schema: two')
  })

  test('throws if a field type is missing', () => {
    let error: Error = new Error('Test failed')
    try {
      assertValidSetFields(['one', 'two'], {
        type: 'object',
        properties: { one: { type: 'string' }, two: {} },
        required: ['one', 'two'],
      })
    } catch (err) {
      error = err
    }
    expect(error.message).toBe('Invalid schema fields for SET account relation')
    expect(error.errors[0].message).toBe('Missing type for field: two')
  })

  test('throws if an unsupported type is used', () => {
    let error: Error = new Error('Test failed')
    try {
      assertValidSetFields(['one', 'two'], {
        type: 'object',
        properties: { one: { type: 'array' }, two: { type: 'object' } },
        required: ['one', 'two'],
      })
    } catch (err) {
      error = err
    }
    expect(error.message).toBe('Invalid schema fields for SET account relation')
    expect(error.errors[0].message).toBe(
      'Unsupported type array for field one set in the account relation, only the following types are supported: boolean, integer, number, string',
    )
    expect(error.errors[1].message).toBe(
      'Unsupported type object for field two set in the account relation, only the following types are supported: boolean, integer, number, string',
    )
  })

  test('throws if a relation field is not required', () => {
    let error: Error = new Error('Test failed')
    try {
      assertValidSetFields(['one', 'two'], {
        type: 'object',
        properties: { one: { type: 'string' }, two: { type: 'string' } },
      })
    } catch (err) {
      error = err
    }
    expect(error.message).toBe('Invalid schema fields for SET account relation')
    expect(error.errors[0].message).toBe(
      'Field one must be required to be used for the SET account relation',
    )
    expect(error.errors[1].message).toBe(
      'Field two must be required to be used for the SET account relation',
    )
  })

  test('supports boolean type', () => {
    expect(() => {
      assertValidSetFields(['one', 'two'], {
        type: 'object',
        properties: {
          one: { type: 'boolean' },
          two: { $ref: '#/$defs/refSchema' },
        },
        required: ['one', 'two'],
        $defs: { refSchema: { type: 'boolean' } },
      })
    }).not.toThrow()
  })

  test('supports integer type', () => {
    expect(() => {
      assertValidSetFields(['one', 'two'], {
        type: 'object',
        properties: {
          one: { type: 'integer' },
          two: { $ref: '#/$defs/refSchema' },
        },
        required: ['one', 'two'],
        $defs: { refSchema: { type: 'integer' } },
      })
    }).not.toThrow()
  })

  test('supports number type', () => {
    expect(() => {
      assertValidSetFields(['one', 'two'], {
        type: 'object',
        properties: {
          one: { type: 'number' },
          two: { $ref: '#/$defs/refSchema' },
        },
        required: ['one', 'two'],
        $defs: { refSchema: { type: 'number' } },
      })
    }).not.toThrow()
  })

  test('supports string type', () => {
    expect(() => {
      assertValidSetFields(['one', 'two'], {
        type: 'object',
        properties: {
          one: { type: 'string' },
          two: { $ref: '#/$defs/refSchema' },
        },
        required: ['one', 'two'],
        $defs: { refSchema: { type: 'string' } },
      })
    }).not.toThrow()
  })
})

describe('validateController()', () => {
  test('requires the CACAO block to be provided if the controller uses did:pkh', async () => {
    await expect(async () => {
      await validateController('did:pkh:123')
    }).rejects.toThrow('Missing CACAO block to validate did:pkh controller')
  })

  test('validates the CACAO block if the controller uses did:pkh', async () => {
    const cacaoBlock = await CacaoBlock.fromCacao(validCacao)

    await expect(async () => {
      await validateController('did:pkh:456', cacaoBlock.bytes)
    }).rejects.toThrow(
      'Invalid CACAO: issuer did:pkh:123 does not match controller did:pkh:456',
    )

    await expect(
      validateController('did:pkh:123', cacaoBlock.bytes),
    ).resolves.not.toThrow()
  })

  test('only allows did:key in addition to did:pkh', async () => {
    await expect(async () => {
      await validateController('did:test:123')
    }).rejects.toThrow(
      'Unsupported model controller did:test:123, only did:key and did:pkh are supported',
    )

    await expect(validateController('did:key:123')).resolves.not.toThrow()
  })
})
