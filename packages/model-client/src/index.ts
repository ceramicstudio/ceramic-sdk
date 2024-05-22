import {
  type PartialInitEventHeader,
  type SignedEvent,
  createSignedInitEvent,
} from '@ceramic-sdk/events'
import {
  MODEL,
  type ModelDefinition,
  assertValidModelContent,
  validateController,
} from '@ceramic-sdk/model-protocol'
import type { DID } from 'dids'

const header: PartialInitEventHeader = { model: MODEL, sep: 'model' }

export async function createInitEvent(
  did: DID,
  data: ModelDefinition,
): Promise<SignedEvent> {
  assertValidModelContent(data)
  if (!did.authenticated) {
    await did.authenticate()
  }
  const controller = did.hasParent ? did.parent : did.id
  const event = await createSignedInitEvent(did, data, header)
  await validateController(controller, event.cacaoBlock)
  return event
}
