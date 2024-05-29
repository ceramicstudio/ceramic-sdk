import { fromString as bytesFromString } from 'uint8arrays'

import type { UnknowContent } from './types.js'

export function getUniqueFieldsValue(
  fields: Array<string>,
  content: UnknowContent,
): string {
  return fields
    .map((field) => {
      const value = content[field]
      return value ? String(value) : ''
    })
    .join('|')
}

export function encodeUniqueFieldsValue(values: Array<string>): Uint8Array {
  return bytesFromString(values.join('|'))
}
