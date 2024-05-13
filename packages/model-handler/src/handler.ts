import { verifyEvent } from '@ceramic-sdk/events'
import {
  type ModelDefinition,
  ModelMetadata,
  type ModelState,
  assertValidModelContent,
  getModelStreamID,
  validateController,
} from '@ceramic-sdk/model-protocol'
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
): Promise<ModelState> {
  const verified = await verifyEvent<ModelDefinition>(context.verifier, event)

  const metadata = decode(ModelMetadata, {
    controller: verified.header.controllers[0],
    model: verified.header.model,
  })
  await validateController(metadata.controller, event)

  const content = verified.data
  assertValidModelContent(content)
  if (content.version !== '1.0') {
    if (content.interface) {
      validateInterface(content)
    } else {
      await validateImplementedInterfaces(content, context)
    }
  }

  const streamID = await getModelStreamID({
    data: verified.data,
    header: verified.header,
  })

  return { id: streamID.toString(), content, metadata, log: [event] }
}
