import sizeof from 'object-sizeof'

import type { JSONPatchOperation } from './codecs.js'
import { MAX_DOCUMENT_SIZE } from './constants.js'

/**
 * Validate that content does not exceed the maximum size allowed
 * @param content Content to validate
 * @internal
 */
export function assertValidContentLength(content: unknown) {
  if (content != null) {
    const contentLength = sizeof(content)
    if (contentLength > MAX_DOCUMENT_SIZE) {
      throw new Error(
        `Content has size of ${contentLength}B which exceeds maximum size of ${MAX_DOCUMENT_SIZE}B`,
      )
    }
  }
}

/**
 * Validate that patches content does not exceed the maximum size allowed
 * @param patches JSON patches to validate
 * @internal
 */
export function assertValidPatchOperations(patches: Array<JSONPatchOperation>) {
  for (const patch of patches) {
    if (patch.op === 'add' || patch.op === 'replace') {
      assertValidContentLength(patch.value)
    }
  }
}
