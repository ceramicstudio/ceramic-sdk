import {
  DocumentDataEventPayload,
  DocumentInitEventPayload,
} from '@ceramic-sdk/document-protocol'
import {
  type EventContainer,
  TimeEvent,
  eventFromString,
  eventToContainer,
} from '@ceramic-sdk/events'
import { ModelInitEventPayload } from '@ceramic-sdk/model-protocol'
import { createDID } from '@didtools/key-did'
import { type TypeOf, union } from 'codeco'
import 'ts-essentials'

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
