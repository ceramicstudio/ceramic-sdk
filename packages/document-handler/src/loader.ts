import { eventToContainer } from '@ceramic-sdk/events'
import type { CID } from 'multiformats/cid'

import { DocumentEvent, DocumentEventPayload } from './codecs.js'
import type { Context } from './types.js'

type InflightRecord = Record<string, Promise<DocumentEventPayload>>

export async function loadEventPayload(
  id: string,
  context: Context,
): Promise<DocumentEventPayload> {
  const event = await context.client.getEventType(DocumentEvent, id)
  const container = await eventToContainer(
    context.verifier,
    DocumentEventPayload,
    event,
  )
  return container.payload
}

export async function loadEventPayloadsFromLast(
  payload: DocumentEventPayload,
  context: Context,
  inflight: InflightRecord = {},
): Promise<Array<DocumentEventPayload>> {
  const log: Array<DocumentEventPayload> = [payload]
  let prevID: string | undefined = (
    payload as { prev?: string | CID }
  ).prev?.toString()
  while (prevID != null) {
    if (!inflight[prevID]) {
      inflight[prevID] = loadEventPayload(prevID, context)
    }
    const prevPayload = await inflight[prevID]
    log.unshift(prevPayload)
    prevID = (prevPayload as { prev?: string | CID }).prev?.toString()
  }
  return log
}

export async function loadEventPayloadsFromLog(
  log: Array<string>,
  context: Context,
  inflight: InflightRecord = {},
): Promise<Array<DocumentEventPayload>> {
  const promises: Array<Promise<DocumentEventPayload>> = []
  for (const id of log) {
    if (!inflight[id]) {
      inflight[id] = loadEventPayload(id, context)
    }
    promises.push(inflight[id])
  }
  return await Promise.all(promises)
}
