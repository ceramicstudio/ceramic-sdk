import {
  MODEL,
  type ModelDefinition,
  assertValidModelContent,
  validateController,
} from '@ceramic-sdk/stream-model'
import type { DID, EventHeader, SignedEvent } from '@ceramic-sdk/types'

export async function createInitEventPayload(
  did: DID,
  data: ModelDefinition,
): Promise<SignedEvent> {
  assertValidModelContent(data)
  if (!did.authenticated) {
    await did.authenticate()
  }

  const controller = did.hasParent ? did.parent : did.id
  const header: EventHeader = {
    sep: 'model',
    model: MODEL.bytes,
    controllers: [controller],
  }
  const event = await did.createDagJWS({ data, header })
  await validateController(controller, event)

  return event
}
