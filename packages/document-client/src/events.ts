import {
  type DeterministicInitEventPayload,
  type DocumentDataEventHeader,
  DocumentDataEventPayload,
  type JSONPatchOperation,
  assertValidContentLength,
  assertValidPatchOperations,
} from '@ceramic-sdk/document-protocol'
import {
  type SignedEvent,
  createSignedInitEvent,
  signEvent,
} from '@ceramic-sdk/events'
import type { CommitID, StreamID } from '@ceramic-sdk/identifiers'
import type { DIDString } from '@didtools/codecs'
import type { DID } from 'dids'

import type { UnknownContent } from './types.js'
import { createInitHeader, getPatchOperations } from './utils.js'

export type CreateInitEventParams<T extends UnknownContent = UnknownContent> = {
  content: T
  controller: DID
  model: StreamID
  context?: StreamID
  shouldIndex?: boolean
}

export async function createInitEvent<
  T extends UnknownContent = UnknownContent,
>(params: CreateInitEventParams<T>): Promise<SignedEvent> {
  const { content, controller, ...headerParams } = params
  assertValidContentLength(content)
  const header = createInitHeader({
    ...headerParams,
    controller: controller.id,
    unique: false, // non-deterministic event
  })
  return await createSignedInitEvent(controller, content, header)
}

export function getDeterministicInitEvent(
  model: StreamID,
  controller: DIDString | string,
  uniqueValue?: Uint8Array,
): DeterministicInitEventPayload {
  return {
    data: null,
    header: createInitHeader({
      model,
      controller,
      unique: uniqueValue ?? true,
    }),
  }
}

export function createDataEventPayload(
  current: CommitID,
  data: Array<JSONPatchOperation>,
  header?: DocumentDataEventHeader,
): DocumentDataEventPayload {
  assertValidPatchOperations(data)
  const payload: DocumentDataEventPayload = {
    data,
    id: current.baseID.cid,
    prev: current.commit,
  }
  if (header != null) {
    payload.header = header
  }
  if (!DocumentDataEventPayload.is(payload)) {
    throw new Error('Invalid payload')
  }
  return payload
}

export type CreateDataEventParams<T extends UnknownContent = UnknownContent> = {
  controller: DID
  currentID: CommitID
  content?: T
  currentContent?: T
  context?: StreamID
  shouldIndex?: boolean
}

export async function createDataEvent<
  T extends UnknownContent = UnknownContent,
>(params: CreateDataEventParams<T>): Promise<SignedEvent> {
  const operations = getPatchOperations(params.currentContent, params.content)
  // Header must only be provided if there are values
  // CBOR encoding doesn't support undefined values
  const header =
    params.shouldIndex == null ? undefined : { shouldIndex: params.shouldIndex }
  const payload = createDataEventPayload(params.currentID, operations, header)
  return await signEvent(params.controller, payload)
}
