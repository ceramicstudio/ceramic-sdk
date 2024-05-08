import {
  type ModelInitEventPayload,
  ModelMetadata,
  type ModelSnapshot,
  assertValidModelContent,
  validateController,
} from '@ceramic-sdk/stream-model'
import type { SignedEvent } from '@ceramic-sdk/types'
import { decode } from 'codeco'

import {
  validateImplementedInterfaces,
  validateInterface,
} from './interfaces-validation.js'
import type { Context } from './types.js'

export async function handleInitEvent(
  event: SignedEvent,
  context: Context,
): Promise<ModelSnapshot> {
  const verified = await context.verifier.verifyJWS(event.jws)
  const payload = verified.payload as ModelInitEventPayload

  const metadata = decode(ModelMetadata, {
    controller: payload.header.controllers[0],
    model: payload.header.model,
  })
  await validateController(metadata.controller, event)

  const content = payload.data
  assertValidModelContent(content)
  if (content.version !== '1.0') {
    if (content.interface) {
      validateInterface(content)
    } else {
      await validateImplementedInterfaces(content, context)
    }
  }

  return { content, metadata }
}
