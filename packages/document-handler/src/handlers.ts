import {
  DocumentInitEventPayload,
  DocumentMetadata,
  type EncodedDocumentMetadata,
  assertValidContentLength,
  getDeterministicStreamID,
  getStreamID,
} from '@ceramic-sdk/document-protocol'
import { eventToContainer } from '@ceramic-sdk/events'
import type { StreamID } from '@ceramic-sdk/identifiers'

import { assertValidContent, assertValidInitHeader } from './assertions.js'
import type { Context, DocumentState } from './types.js'
import { validateRelationsContent } from './validation.js'

export async function handleInitEvent(
  event: unknown,
  context: Context,
): Promise<DocumentState> {
  const container = await eventToContainer(
    context.verifier,
    DocumentInitEventPayload,
    event,
  )
  const { data, header } = container.payload

  const modelID = header.model.toString()
  const definition = await context.loadModelDefinition(modelID)
  assertValidInitHeader(definition, header)

  let streamID: StreamID
  let metadata: EncodedDocumentMetadata
  if (container.signed) {
    // Handle non-deterministic event - should have content
    assertValidContentLength(data)
    assertValidContent(modelID, definition.schema, data)
    await validateRelationsContent(context, definition, data)
    streamID = getStreamID(container.cid)
    metadata = DocumentMetadata.encode({
      controller: header.controllers[0],
      model: header.model,
      unique: header.unique,
      context: header.context,
      shouldIndex: header.shouldIndex,
    })
  } else {
    // Handle deterministic event - no content
    if (data !== null) {
      throw new Error(
        'Deterministic init commits for ModelInstanceDocuments must not have content',
      )
    }
    streamID = getDeterministicStreamID(header)
    metadata = DocumentMetadata.encode({
      controller: header.controllers[0],
      model: header.model,
      unique: header.unique,
    })
  }

  return {
    id: streamID.toString(),
    content: data,
    metadata,
    log: [event],
  }
}
