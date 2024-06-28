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
  assertValidModelContent,
  validateController,
} from '@ceramic-sdk/model-protocol'
import type { DID } from 'dids'

import {
  validateImplementedInterfaces,
  validateInterface,
} from './interfaces-validation.js'
import type { Context, InitContext, ModelState, TimeContext } from './types.js'

export async function getInitEventContainer(
  verifier: DID,
  event: SignedEvent,
): Promise<SignedEventContainer<ModelInitEventPayload>> {
  return await signedEventToContainer(verifier, ModelInitEventPayload, event)
}

export async function handleInitEvent(
  cid: string,
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
    content,
    metadata,
    log: [cid],
  }
}

export async function handleTimeEvent(
  cid: string,
  event: TimeEvent,
  context: TimeContext,
): Promise<ModelState> {
  const initID = event.id.toString()
  const state = await context.getModelState(initID)
  if (state.log.length === 0) {
    throw new Error(
      `Invalid model state provided for time event ${cid}: log is empty`,
    )
  }

  const stateInitID = state.log[0]
  if (stateInitID !== initID) {
    throw new Error(
      `Invalid state with model ${stateInitID} provided for time event ${cid}: expected model ${initID}`,
    )
  }

  return { ...state, log: [...state.log, cid] }
}

export async function handleEvent(
  cid: string,
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
