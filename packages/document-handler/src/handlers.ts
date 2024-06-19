import {
  type DeterministicInitEventPayload,
  DocumentDataEventPayload,
  DocumentInitEventPayload,
  assertValidContentLength,
  getStreamID,
} from '@ceramic-sdk/document-protocol'
import { TimeEvent, eventToContainer } from '@ceramic-sdk/events'
import jsonpatch from 'fast-json-patch'
import type { CID } from 'multiformats/cid'

import {
  assertEventLinksToState,
  assertNoImmutableFieldChange,
  assertValidContent,
  assertValidInitHeader,
  assertValidUniqueValue,
} from './assertions.js'
import { type DocumentEvent, DocumentEventPayload } from './codecs.js'
import type { Context, DocumentState } from './types.js'
import { getImmutableFieldsToCheck } from './utils.js'
import { validateRelationsContent } from './validation.js'

export async function handleDeterministicInitPayload(
  cid: CID,
  payload: DeterministicInitEventPayload,
  context: Context,
): Promise<DocumentState> {
  const { data, header } = payload
  if (data !== null) {
    throw new Error(
      'Deterministic init commits for ModelInstanceDocuments must not have content',
    )
  }

  const modelID = header.model.toString()
  const definition = await context.getModelDefinition(modelID)
  assertValidInitHeader(definition, header)

  return {
    cid,
    content: null,
    metadata: {
      controller: header.controllers[0],
      model: header.model,
      unique: header.unique,
    },
    log: [payload],
  }
}

export async function handleInitPayload(
  cid: CID,
  payload: DocumentInitEventPayload,
  context: Context,
): Promise<DocumentState> {
  const { data, header } = payload
  assertValidContentLength(data)

  const modelID = header.model.toString()
  const definition = await context.getModelDefinition(modelID)
  assertValidInitHeader(definition, header)

  assertValidContent(modelID, definition.schema, data)
  await validateRelationsContent(context, definition, data)

  return {
    cid,
    content: data,
    metadata: {
      controller: header.controllers[0],
      model: header.model,
      unique: header.unique,
      context: header.context,
      shouldIndex: header.shouldIndex,
    },
    log: [payload],
  }
}

export async function handleDataPayload(
  payload: DocumentDataEventPayload,
  context: Context,
): Promise<DocumentState> {
  const state = await context.getDocumentState(payload.id)
  assertEventLinksToState(payload, state)

  // Check the header is valid when provided
  if (payload.header != null) {
    const { shouldIndex, ...others } = payload.header
    const otherKeys = Object.keys(others)
    if (otherKeys.length) {
      throw new Error(
        `Updating metadata for ModelInstanceDocument Streams is not allowed.  Tried to change metadata for Stream ${getStreamID(payload.id)} from ${JSON.stringify(
          state.metadata,
        )} to ${JSON.stringify(payload.header)}`,
      )
    }
    // Update metadata if needed
    if (shouldIndex != null) {
      state.metadata.shouldIndex = shouldIndex
    }
  }

  // Get updated content by applying the patch to the current content
  const content = jsonpatch.applyPatch(
    state.content ?? {},
    payload.data,
  ).newDocument
  assertValidContentLength(content)

  // Load the model definition for the document and validate the content
  const modelID = state.metadata.model.toString()
  const definition = await context.getModelDefinition(modelID)
  assertValidContent(modelID, definition.schema, content)

  // Check the content satifies the SET account relations and immutable fields constraints
  assertValidUniqueValue(definition, state.metadata, content)
  const immutableFields = getImmutableFieldsToCheck(definition, state)
  if (immutableFields != null) {
    assertNoImmutableFieldChange(payload.data, immutableFields)
  }

  // Validate relations
  await validateRelationsContent(context, definition, content)

  return { ...state, log: [...state.log, payload] }
}

export async function handleTimeEvent(
  event: TimeEvent,
  context: Context,
): Promise<DocumentState> {
  const state = await context.getDocumentState(event.id)
  assertEventLinksToState(event, state)
  return { ...state, log: [...state.log, event] }
}

export async function handleEvent(
  cid: CID,
  event: DocumentEvent,
  context: Context,
): Promise<DocumentState> {
  const container = await eventToContainer(
    context.verifier,
    DocumentEventPayload,
    event,
  )
  if (container.signed) {
    // Signed event is either non-deterministic init or data
    if (DocumentDataEventPayload.is(container.payload)) {
      return await handleDataPayload(container.payload, context)
    }
    if (DocumentInitEventPayload.is(container.payload)) {
      return await handleInitPayload(cid, container.payload, context)
    }
  }
  // Unsigned event is either deterministic init or time
  if (TimeEvent.is(container.payload)) {
    return await handleTimeEvent(container.payload as TimeEvent, context)
  }
  return await handleDeterministicInitPayload(cid, container.payload, context)
}
