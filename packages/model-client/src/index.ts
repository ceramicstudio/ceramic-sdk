import {
  MODEL,
  type ModelDefinition,
  type ModelInitEventPayload,
  assertValidModelContent,
  validateController,
} from '@ceramic-sdk/model-protocol'
import type { DID, SignedEvent } from '@ceramic-sdk/types'

export async function createInitEventPayload(
  did: DID,
  data: ModelDefinition,
): Promise<SignedEvent> {
  assertValidModelContent(data)
  if (!did.authenticated) {
    await did.authenticate()
  }

  const controller = did.hasParent ? did.parent : did.id
  const payload: ModelInitEventPayload = {
    data,
    header: {
      sep: 'model',
      model: MODEL.bytes,
      controllers: [controller],
    },
  }
  const event = await did.createDagJWS(payload)
  await validateController(controller, event.cacaoBlock)

  return event
}
