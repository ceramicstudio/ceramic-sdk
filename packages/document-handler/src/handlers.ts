import {
  type DeterministicInitEventPayload,
  DocumentDataEventPayload,
  DocumentInitEventPayload,
  assertValidContentLength,
} from '@ceramic-sdk/document-protocol'
import { TimeEvent, eventToContainer } from '@ceramic-sdk/events'
import jsonpatch from 'fast-json-patch'

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
  cid: string,
  payload: DeterministicInitEventPayload,
  context: Context,
): Promise<DocumentState> {
  const { data, header } = payload
  if (data !== null) {
    throw new Error(
      'Deterministic init events for ModelInstanceDocuments must not have content',
    )
  }

  const modelID = header.model.toString()
  const definition = await context.getModelDefinition(modelID)
  assertValidInitHeader(definition, header)

  return {
    content: null,
    metadata: {
      controller: header.controllers[0],
      model: header.model,
      unique: header.unique,
    },
    log: [cid],
  }
}

export async function handleInitPayload(
  cid: string,
  payload: DocumentInitEventPayload,
  context: Context,
): Promise<DocumentState> {
  const { data, header } = payload
  if (data == null) {
    throw new Error(
      'Signed init events for ModelInstanceDocuments must have content',
    )
  }
  assertValidContentLength(data)

  const modelID = header.model.toString()
  const definition = await context.getModelDefinition(modelID)
  assertValidInitHeader(definition, header)

  assertValidContent(modelID, definition.schema, data)
  await validateRelationsContent(context, definition, data)

  return {
    content: data,
    metadata: {
      controller: header.controllers[0],
      model: header.model,
      unique: header.unique,
      context: header.context,
      shouldIndex: header.shouldIndex,
    },
    log: [cid],
  }
}

export async function handleDataPayload(
  cid: string,
  payload: DocumentDataEventPayload,
  context: Context,
): Promise<DocumentState> {
  const state = await context.getDocumentState(payload.id)
  assertEventLinksToState(payload, state)

  const metadata = { ...state.metadata }

  // Check the header is valid when provided
  if (payload.header != null) {
    const { shouldIndex, ...others } = payload.header
    const otherKeys = Object.keys(others)
    if (otherKeys.length) {
      throw new Error(
        `Updating metadata for ModelInstanceDocument Streams is not allowed.  Tried to change metadata for ${payload.id} from ${JSON.stringify(
          state.metadata,
        )} to ${JSON.stringify(payload.header)}`,
      )
    }
    // Update metadata if needed
    if (shouldIndex != null) {
      metadata.shouldIndex = shouldIndex
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

  return { content, metadata, log: [...state.log, cid] }
}

export async function handleTimeEvent(
  cid: string,
  event: TimeEvent,
  context: Context,
): Promise<DocumentState> {
  const state = await context.getDocumentState(event.id.toString())
  assertEventLinksToState(event, state)
  return { ...state, log: [...state.log, cid] }
}

export async function handleEvent(
  cid: string,
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
      return await handleDataPayload(cid, container.payload, context)
    }
    if (DocumentInitEventPayload.is(container.payload)) {
      return await handleInitPayload(cid, container.payload, context)
    }
  }
  // Unsigned event is either deterministic init or time
  if (TimeEvent.is(container.payload)) {
    return await handleTimeEvent(cid, container.payload as TimeEvent, context)
  }
  return await handleDeterministicInitPayload(cid, container.payload, context)
}
