import {
  type SignedEvent,
  type SignedEventContainer,
  signedEventToContainer,
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

export async function getInitEventContainer(
  verifier: DID,
  event: SignedEvent,
): Promise<SignedEventContainer<ModelInitEventPayload>> {
  return await signedEventToContainer(verifier, ModelInitEventPayload, event)
}

export async function handleInitEvent(
  event: SignedEvent,
  context: Context,
): Promise<ModelState> {
  const { payload } = await getInitEventContainer(context.verifier, event)

  const metadata = ModelMetadata.encode({
    controller: payload.header.controllers[0],
    model: payload.header.model,
  })
  await validateController(metadata.controller, event.cacaoBlock)

  const content = payload.data
  assertValidModelContent(content)
  if (content.version !== '1.0') {
    if (content.interface) {
      validateInterface(content)
    }
    await validateImplementedInterfaces(content, context)
  }

  const streamID = getModelStreamID({
    data: payload.data,
    header: payload.header,
  })

  return { id: streamID.toString(), content, metadata, log: [event] }
}
