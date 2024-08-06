import {
  assertValidContentLength,
  assertValidPatchOperations,
} from '../src/assertions.js'
import { MAX_DOCUMENT_SIZE } from '../src/constants.js'

const validValue = 'a'.repeat(MAX_DOCUMENT_SIZE - 20)
const invalidValue = validValue + 'a'.repeat(20)

describe('assertValidContentLength()', () => {
  test('throws if the content exceeds the max document size', () => {
    expect(() => assertValidContentLength({ value: invalidValue })).toThrow(
      'Content has size of 16000012B which exceeds maximum size of 16000000B',
    )
  })

  test('does not throw if the content is within the max document size', () => {
    assertValidContentLength({ value: validValue })
  })
})

describe('assertValidPatchOperations()', () => {
  test('throws if the content of an "add" operation exceeds the max document size', () => {
    expect(() => {
      assertValidPatchOperations([
        { op: 'add', path: '/a', value: invalidValue },
      ])
    }).toThrow(
      'Content has size of 16000012B which exceeds maximum size of 16000000B',
    )
  })

  test('throws if the content of a "replace" operation exceeds the max document size', () => {
    expect(() => {
      assertValidPatchOperations([
        { op: 'replace', path: '/a', value: invalidValue },
      ])
    }).toThrow(
      'Content has size of 16000012B which exceeds maximum size of 16000000B',
    )
  })

  test('does not throw if the content of operations do not exceed the max document size', () => {
    assertValidPatchOperations([
      { op: 'add', path: '/a', value: validValue },
      { op: 'replace', path: '/b', value: validValue },
    ])
  })
})
