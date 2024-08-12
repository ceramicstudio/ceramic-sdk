import { type EventContainer, carFromBytes } from '@ceramic-sdk/events'
import {
  type Context as ModelHandlerContext,
  type ModelState,
  handleEvent as handleModelEvent,
} from '@ceramic-sdk/model-handler'
import {
  type Context as DocumentHandlerContext,
  type DocumentState,
  handleEvent as handleDocumentEvent,
} from '@ceramic-sdk/model-instance-handler'
import {
  type DocumentEvent,
  DocumentInitEventPayload,
} from '@ceramic-sdk/model-instance-protocol'
import {
  type ModelEvent,
  ModelInitEventPayload,
} from '@ceramic-sdk/model-protocol'

import { queryStreamEvents } from './data/db.ts'
import type { EventResult } from './data/types.ts'
import { type SupportedPayload, carToContainer, verifier } from './events.ts'

// event CID + container tuple
export type StreamEntry = [string, EventContainer<SupportedPayload>]

export type SupportedState = DocumentState | ModelState

export async function getOrderedStream(
  initID: string,
): Promise<Array<StreamEntry>> {
  const results = await queryStreamEvents(initID)

  let initResult: EventResult | undefined
  const nextResults: Record<string, EventResult> = {}
  for (const result of results) {
    if (result.prev_id == null) {
      initResult = result
      continue
    }
    const next = results.find((r) => r.prev_id === result.id)
    if (next != null) {
      nextResults[result.id] = next
    }
  }

  if (initResult == null) {
    return []
  }

  const orderedResults: Array<EventResult> = []
  let nextResult = initResult
  while (nextResult != null) {
    orderedResults.push(nextResult)
    nextResult = nextResults[nextResult.id]
  }

  return await Promise.all(
    orderedResults.map(async (r) => {
      const car = carFromBytes(r.car_bytes)
      return [r.id, await carToContainer(car)]
    }),
  )
}

export async function aggregateDocumentStream(
  entries: Array<StreamEntry>,
): Promise<DocumentState> {
  let state: DocumentState | undefined
  const context: DocumentHandlerContext = {
    getDocumentModel: () => {
      // TODO: load document from DB
      // might need to query events and get the model from the init header
      return Promise.reject(new Error('Not supported'))
    },
    getDocumentState: () => {
      return state
        ? Promise.resolve(state)
        : Promise.reject(new Error('No state'))
    },
    getModelDefinition: () => {
      // TODO: load model definition from DB
      // might need to query events and aggregate model first if not yet saved in DB
      return Promise.reject(new Error('Not supported'))
    },
    verifier,
  }
  for (const [id, event] of entries) {
    state = await handleDocumentEvent(
      id,
      event as unknown as DocumentEvent,
      context,
    )
  }
  if (state == null) {
    throw new Error('Aggregation failed')
  }
  return state
}

export async function aggregateModelStream(
  entries: Array<StreamEntry>,
): Promise<ModelState> {
  let state: ModelState | undefined
  const context: ModelHandlerContext = {
    getModelDefinition: () => {
      // TODO: load model definition from DB
      // might need to query events and aggregate model first if not yet saved in DB
      return Promise.reject(new Error('Not supported'))
    },
    getModelState: () => {
      return state
        ? Promise.resolve(state)
        : Promise.reject(new Error('No state'))
    },
    verifier,
  }
  for (const [id, event] of entries) {
    state = await handleModelEvent(id, event as unknown as ModelEvent, context)
  }
  if (state == null) {
    throw new Error('Aggregation failed')
  }
  return state
}

export async function aggregateStream(entries: Array<StreamEntry>) {
  if (entries.length === 0) {
    throw new Error('Invalid stream to aggregate: no entries')
  }

  const initPayload = entries[0][1]
  if (ModelInitEventPayload.is(initPayload)) {
    return await aggregateModelStream(entries)
  }
  if (DocumentInitEventPayload.is(initPayload)) {
    return await aggregateDocumentStream(entries)
  }

  throw new Error('Unsupported stream type')
}
