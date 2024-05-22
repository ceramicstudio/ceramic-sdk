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
import { decode } from 'codeco'
import type { DID } from 'dids'
import jsonpatch from 'fast-json-patch'

import { createInitHeader } from './utils.js'

type UnknowContent = Record<string, unknown>

export type CreateInitEventParams<T extends UnknowContent = UnknowContent> = {
  content: T
  controller: DID
  model: StreamID
  context?: StreamID
  shouldIndex?: boolean
}

export async function createInitEvent<T extends UnknowContent = UnknowContent>(
  params: CreateInitEventParams<T>,
): Promise<SignedEvent> {
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
  return decode(DocumentDataEventPayload, payload)
}

export type CreateDataEventParams<T extends UnknowContent = UnknowContent> = {
  controller: DID
  currentID: CommitID
  content?: T
  currentContent?: T
  context?: StreamID
  shouldIndex?: boolean
}

export async function createDataEvent<T extends UnknowContent = UnknowContent>(
  params: CreateDataEventParams<T>,
): Promise<SignedEvent> {
  const operations = jsonpatch.compare(
    params.currentContent ?? {},
    params.content ?? {},
  ) as Array<JSONPatchOperation>
  // Header must only be provided if there are values
  // CBOR encoding doesn't support undefined values
  let header: DocumentDataEventHeader | undefined = undefined
  if (params.context != null || params.shouldIndex != null) {
    header = {}
    if (params.context != null) {
      header.context = params.context
    }
    if (params.shouldIndex != null) {
      header.shouldIndex = params.shouldIndex
    }
  }
  const payload = createDataEventPayload(params.currentID, operations, header)
  return await signEvent(params.controller, payload)
}
