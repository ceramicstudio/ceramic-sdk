import {
  SignedEvent,
  type SignedEventContainer,
  TimeEvent,
  signedEventToContainer,
} from '@ceramic-sdk/events'
import {
  type ModelEvent,
  ModelInitEventPayload,
  ModelMetadata,
  type ModelState,
  assertValidModelContent,
  validateController,
} from '@ceramic-sdk/model-protocol'
import type { DID } from 'dids'
import type { CID } from 'multiformats/cid'

import {
  validateImplementedInterfaces,
  validateInterface,
} from './interfaces-validation.js'
import type { Context, InitContext, TimeContext } from './types.js'

export async function getInitEventContainer(
  verifier: DID,
  event: SignedEvent,
): Promise<SignedEventContainer<ModelInitEventPayload>> {
  return await signedEventToContainer(verifier, ModelInitEventPayload, event)
}

export async function handleInitEvent(
  cid: CID,
  event: SignedEvent,
  context: InitContext,
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

  return {
    cid,
    content,
    metadata,
    log: [event],
  }
}

export async function handleTimeEvent(
  cid: CID,
  event: TimeEvent,
  context: TimeContext,
): Promise<ModelState> {
  const state = await context.getModelState(event.id)
  if (!state.cid.equals(event.id)) {
    throw new Error(
      `Invalid state with model ${state.cid} provided for time event ${cid}: expected model ${event.id}`,
    )
  }

  const init = state.log[0]
  if (init == null) {
    throw new Error(
      `Invalid state for model ${state.cid} provided for time event ${cid}: no events in log`,
    )
  }

  return { ...state, log: [...state.log, event] }
}

export async function handleEvent(
  cid: CID,
  event: ModelEvent,
  context: Context,
): Promise<ModelState> {
  if (SignedEvent.is(event)) {
    return await handleInitEvent(cid, event, context)
  }
  if (TimeEvent.is(event)) {
    return await handleTimeEvent(cid, event, context)
  }
  throw new Error(`Unsupported event: ${cid}`)
}
