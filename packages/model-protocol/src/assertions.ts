import { Cacao } from '@didtools/cacao'
import { decode } from 'codeco'
import { JsonReference } from 'json-ptr'
import type { JSONSchema } from 'json-schema-typed/draft-2020-12'

import {
  ModelDefinition,
  ModelRelationsDefinitionV2,
  ObjectSchema,
} from './codecs.js'
import {
  CACAO_MODEL_RESOURCES,
  MODEL_RESOURCE_URI,
  VERSION,
} from './constants.js'

type Schema = Exclude<JSONSchema, boolean>

/**
 * Asserts that all the required fields for the Model are set, and throws an error if not.
 * @param content
 * @internal
 */
export function assertValidDefinition(
  content: unknown,
): asserts content is ModelDefinition {
  decode(ModelDefinition, content)
}

/** @internal */
export const MODEL_VERSION_REGEXP = /^[0-9]+\.[0-9]+$/

/** @internal */
export function parseModelVersion(version: string): [number, number] {
  if (!MODEL_VERSION_REGEXP.test(version)) {
    throw new Error(`Unsupported version format: ${version}`)
  }
  const [major, minor] = version
    .split('.')
    .map((part) => Number.parseInt(part, 10))
  return [major, minor]
}

/**
 * Version check to satisfy:
 * - 'major': only major version match needs to be satisfied
 * - 'minor': both major and minor versions matches need to be satisfied
 */
export type ValidVersionSatisfies = 'major' | 'minor'

/**
 * Asserts that the version of the model definition is supported.
 * @param content - Model definition object
 * @param satisfies - Version range to satisfy
 * @internal
 */
export function assertValidVersion(
  content: ModelDefinition,
  satisfies: ValidVersionSatisfies = 'minor',
): void {
  if (content.version == null) {
    // @ts-ignore never case
    throw new Error(`Missing version for model ${content.name}`)
  }
  const [expectedMajor, expectedMinor] = parseModelVersion(VERSION)
  const [major, minor] = parseModelVersion(content.version)

  if (
    major > expectedMajor ||
    (satisfies === 'minor' && major === expectedMajor && minor > expectedMinor)
  ) {
    throw new Error(
      `Unsupported version ${content.version} for model ${content.name}, the maximum version supported by the Ceramic node is ${VERSION}. Please update your Ceramic node to a newer version supporting at least version ${content.version} of the Model definition.`,
    )
  }
}

/**
 * Asserts that the relations properties of the given ModelDefinition are well formed, and throws an error if not.
 * @internal
 */
export function assertValidRelations(content: ModelDefinition) {
  if (content.relations != null) {
    decode(ModelRelationsDefinitionV2, content.relations)
  }
}

/** @internal */
export function assertValidCacao(cacao: Cacao, controller: string): void {
  if (cacao.p.iss !== controller) {
    throw new Error(
      `Invalid CACAO: issuer ${cacao.p.iss} does not match controller ${controller}`,
    )
  }
  if (cacao.p.exp != null) {
    throw new Error(
      'Invalid CACAO: Model Streams do not support CACAOs with expiration times',
    )
  }

  const foundResource = (cacao.p.resources ?? []).find((resource) => {
    return CACAO_MODEL_RESOURCES.includes(resource)
  })
  if (foundResource == null) {
    throw new Error(`Invalid CACAO: missing resource "${MODEL_RESOURCE_URI}"`)
  }
}

/** @internal */
export async function validateController(
  controller: string,
  cacaoBlock?: Uint8Array,
): Promise<void> {
  if (controller.startsWith('did:pkh:')) {
    if (cacaoBlock == null) {
      throw new Error('Missing CACAO block to validate did:pkh controller')
    }
    const cacao = await Cacao.fromBlockBytes(cacaoBlock)
    assertValidCacao(cacao, controller)
  } else if (!controller.startsWith('did:key:')) {
    throw new Error(
      `Unsupported model controller ${controller}, only did:key and did:pkh are supported`,
    )
  }
}

type FieldSchema = Exclude<JSONSchema, boolean>

const SUPPORTED_FIELD_TYPES = ['boolean', 'integer', 'number', 'string']

/**
 * Validate model schema fields used by the SET account relation
 * @param fields - Array of field names used by the SET account relation
 * @param modelSchema - JSON schema of the model
 * @internal
 */
export function assertValidSetFields(
  fields: Array<string>,
  modelSchema: JSONSchema.Object,
): void {
  if (fields.length === 0) {
    throw new Error(
      'At least one field must be defined for the SET account relation',
    )
  }

  const properties = modelSchema.properties
  if (properties == null) {
    throw new Error('Missing schema properties object')
  }

  const requiredFields = modelSchema.required ?? []

  const errors: Array<Error> = []
  for (const field of fields) {
    let fieldSchema = properties[field] as FieldSchema | undefined
    if (fieldSchema?.$ref != null) {
      // Resolve field schema if a reference is used
      const ref = new JsonReference(fieldSchema.$ref)
      fieldSchema = ref.resolve(modelSchema) as FieldSchema | undefined
    }
    if (fieldSchema == null) {
      errors.push(new Error(`Field not found in schema: ${field}`))
    } else {
      const fieldType = fieldSchema.type
      if (fieldType == null) {
        errors.push(new Error(`Missing type for field: ${field}`))
      } else if (!SUPPORTED_FIELD_TYPES.includes(fieldType as string)) {
        errors.push(
          new Error(
            `Unsupported type ${fieldType} for field ${field} set in the account relation, only the following types are supported: ${SUPPORTED_FIELD_TYPES.join(
              ', ',
            )}`,
          ),
        )
      }
      if (!requiredFields.includes(field)) {
        errors.push(
          new Error(
            `Field ${field} must be required to be used for the SET account relation`,
          ),
        )
      }
    }
  }

  if (errors.length) {
    throw new AggregateError(
      errors,
      'Invalid schema fields for SET account relation',
    )
  }
}

/** @internal */
export function assertValidAccountRelation(content: ModelDefinition) {
  if (content.version !== '1.0' && content.accountRelation.type === 'set') {
    assertValidSetFields(content.accountRelation.fields, content.schema)
  }
}

/**
 * Takes the schema and applies the fn function to it and its object properties recursively.
 *
 * @param schema a SchemaObject schema from JSON Schema standard
 * @param fn a function taking schema's properties and calls recursiveMap recursively on them, if they're object properties
 */
function recursiveMap(schema: Schema, fn: (schemaProperty: object) => void) {
  fn(schema)

  for (const schemaPropertyName of Object.getOwnPropertyNames(schema)) {
    if (
      // @ts-ignore any type
      schema[schemaPropertyName] !== null &&
      // @ts-ignore any type
      typeof schema[schemaPropertyName] === 'object'
    ) {
      // @ts-ignore any type
      recursiveMap(schema[schemaPropertyName], fn)
    }
  }
}

/**
 * Verifies that a JSON Schema schema has additional properties disabled, if it's an object schema
 *
 * @param schema: a SchemaObject schema
 * @throws if the schema is an object schema that allows for additional properties
 */
function validateAdditionalProperties(schema: Schema): void {
  if (schema.type === 'object' && schema.additionalProperties !== false) {
    throw new Error(
      'All objects in schema need to have additional properties disabled',
    )
  }
}

/** @internal */
export function assertValidSchema(
  schema: unknown,
): asserts schema is JSONSchema.Object {
  const decoded = decode(ObjectSchema, schema)
  recursiveMap(decoded, validateAdditionalProperties)
}

/**
 * Asserts that the model definition is valid and throws an error if it's not.
 *
 * @param content the model definition object
 */
export function assertValidModelContent(content: ModelDefinition) {
  assertValidVersion(content, 'minor')
  assertValidDefinition(content)
  assertValidSchema(content.schema)
  assertValidAccountRelation(content)
  assertValidRelations(content)
}
