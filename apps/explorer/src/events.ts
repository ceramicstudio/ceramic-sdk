import {
  type EventContainer,
  TimeEvent,
  eventFromCAR,
  eventFromString,
  eventToContainer,
} from '@ceramic-sdk/events'
import type { CeramicClient } from '@ceramic-sdk/http-client'
import {
  DocumentDataEventPayload,
  DocumentInitEventPayload,
} from '@ceramic-sdk/model-instance-protocol'
import { ModelInitEventPayload } from '@ceramic-sdk/model-protocol'
import { createDID } from '@didtools/key-did'
import type { CAR } from 'cartonne'
import { type TypeOf, union } from 'codeco'
import 'ts-essentials'

import { insertEvents } from './data/db.ts'
import type { InsertEvent } from './data/types.ts'

const did = createDID()

const SupportedPayload = union([
  DocumentDataEventPayload,
  DocumentInitEventPayload,
  ModelInitEventPayload,
  TimeEvent,
])
export type SupportedPayload = TypeOf<typeof SupportedPayload>

export async function decodeEvent(
  data: string,
): Promise<EventContainer<SupportedPayload>> {
  const event = eventFromString(SupportedPayload, data)
  return await eventToContainer(did, SupportedPayload, event)
}

async function toInsertEvent(id: string, car: CAR): Promise<InsertEvent> {
  const event = eventFromCAR(SupportedPayload, car)
  const container = await eventToContainer(did, SupportedPayload, event)

  if (
    ModelInitEventPayload.is(container.payload) ||
    DocumentInitEventPayload.is(container.payload)
  ) {
    return { id, init_id: id, car_bytes: car.bytes }
  }

  if (
    DocumentDataEventPayload.is(container.payload) ||
    TimeEvent.is(container.payload)
  ) {
    const p = container.payload as TimeEvent
    return {
      id,
      init_id: p.id.toString(),
      prev_id: p.prev.toString(),
      car_bytes: car.bytes,
    }
  }

  throw new Error('Unsupported event payload')
}

export async function loadEventToInsert(
  client: CeramicClient,
  id: string,
): Promise<InsertEvent> {
  const car = await client.getEventCAR(id)
  return await toInsertEvent(id, car)
}

export async function pullFromFeed(
  client: CeramicClient,
  resumeAt?: string,
): Promise<[boolean, string]> {
  const results = await client.getEventsFeed({ resumeAt })
  if (results.events.length === 0) {
    return [false, results.resumeToken]
  }

  const events = await Promise.all(
    results.events.map(async (event) => {
      return await loadEventToInsert(client, event.id)
    }),
  )
  await insertEvents(events)
  return [true, results.resumeToken]
}
