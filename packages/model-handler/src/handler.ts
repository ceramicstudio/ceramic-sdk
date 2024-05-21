import {
  type SignedEvent,
  type VerifiedEvent,
  verifyEvent,
} from '@ceramic-sdk/events'
import {
  ModelInitEventPayload,
  ModelMetadata,
  type ModelState,
  assertValidModelContent,
  getModelStreamID,
  validateController,
} from '@ceramic-sdk/model-protocol'
import type { DID } from 'dids'

import {
  validateImplementedInterfaces,
  validateInterface,
} from './interfaces-validation.js'
import type { Context } from './types.js'

export async function verifyInitEvent(
  verifier: DID,
  event: SignedEvent,
): Promise<VerifiedEvent<ModelInitEventPayload>> {
  return await verifyEvent(verifier, event, ModelInitEventPayload)
}

export async function handleInitEvent(
  event: SignedEvent,
  context: Context,
): Promise<ModelState> {
  const verified = await verifyInitEvent(context.verifier, event)

  const metadata = ModelMetadata.encode({
    controller: verified.header.controllers[0],
    model: verified.header.model,
  })
  await validateController(metadata.controller, event.cacaoBlock)

  const content = verified.data
  assertValidModelContent(content)
  if (content.version !== '1.0') {
    if (content.interface) {
      validateInterface(content)
    }
    await validateImplementedInterfaces(content, context)
  }

  const streamID = await getModelStreamID({
    data: verified.data,
    header: verified.header,
  })

  return { id: streamID.toString(), content, metadata, log: [event] }
}
