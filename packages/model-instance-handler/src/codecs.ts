import { SignedEvent, TimeEvent } from '@ceramic-sdk/events'
import {
  DeterministicInitEventPayload,
  DocumentDataEventPayload,
  DocumentInitEventPayload,
} from '@ceramic-sdk/model-instance-protocol'
import { type OutputOf, type TypeOf, union } from 'codeco'
import 'ts-essentials' // Import needed for TS reference

export const DocumentEvent = union(
  [
    DeterministicInitEventPayload,
    SignedEvent, // non-deterministic init or data payload
    TimeEvent,
  ],
  'DocumentEvent',
)
export type DocumentEvent = OutputOf<typeof DocumentEvent>

export const DocumentEventPayload = union(
  [
    DeterministicInitEventPayload,
    DocumentInitEventPayload,
    DocumentDataEventPayload,
    TimeEvent,
  ],
  'DocumentEventPayload',
)
export type DocumentEventPayload = TypeOf<typeof DocumentEventPayload>
