import {
  type EventContainer,
  TimeEvent,
  carFromString,
  eventFromCAR,
  eventFromString,
  eventToContainer,
} from '@ceramic-sdk/events'
import type { CeramicClient, Schema } from '@ceramic-sdk/http-client'
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

export const verifier = createDID()

export const SupportedPayload = union([
  DocumentDataEventPayload,
  DocumentInitEventPayload,
  ModelInitEventPayload,
  TimeEvent,
])
export type SupportedPayload = TypeOf<typeof SupportedPayload>

export async function carToContainer(
  car: CAR,
): Promise<EventContainer<SupportedPayload>> {
  const event = eventFromCAR(SupportedPayload, car)
  return await eventToContainer(verifier, SupportedPayload, event)
}

export type EventFeed = Schema<'EventFeed'>

export async function decodeEvent(
  data: string,
): Promise<EventContainer<SupportedPayload>> {
  const event = eventFromString(SupportedPayload, data)
  return await eventToContainer(verifier, SupportedPayload, event)
}

type FeedEvent = EventFeed['events'][0]

async function toInsertEvent(input: FeedEvent): Promise<InsertEvent> {
  if (input.data == null) {
    throw new Error('Missing event data')
  }

  const car = carFromString(input.data)
  const container = await carToContainer(car)

  if (
    ModelInitEventPayload.is(container.payload) ||
    DocumentInitEventPayload.is(container.payload)
  ) {
    return { id: input.id, init_id: input.id, car_bytes: car.bytes }
  }

  if (
    DocumentDataEventPayload.is(container.payload) ||
    TimeEvent.is(container.payload)
  ) {
    const p = container.payload as TimeEvent
    return {
      id: input.id,
      init_id: p.id.toString(),
      prev_id: p.prev.toString(),
      car_bytes: car.bytes,
    }
  }

  throw new Error('Unsupported event payload')
}

export async function pullFromFeed(
  client: CeramicClient,
  resumeAt?: string,
): Promise<EventFeed> {
  const result = await client.getEventsFeed({ resumeAt, includeData: 'full' })
  if (result.events.length !== 0) {
    const events = await Promise.all(result.events.map(toInsertEvent))
    await insertEvents(events)
  }
  return result
}
