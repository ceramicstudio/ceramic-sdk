import { streamIDAsBytes } from '@ceramic-sdk/identifiers'
import { JWSSignature, cid, didString, uint8array } from '@didtools/codecs'
import {
  type TypeOf,
  array,
  decode,
  optional,
  sparse,
  strict,
  string,
  tuple,
  union,
  unknown,
} from 'codeco'
import 'multiformats' // Import needed for TS reference
import 'ts-essentials' // Import needed for TS reference

export const DagJWS = sparse({
  payload: string,
  signatures: array(JWSSignature),
  link: optional(cid),
})
export type DagJWS = TypeOf<typeof DagJWS>

export const EventHeader = sparse(
  {
    controllers: tuple([didString]),
    model: streamIDAsBytes,
    sep: string,
    unique: optional(uint8array),
  },
  'EventHeader',
)
export type EventHeader = TypeOf<typeof EventHeader>

export function decodeEventHeader(input: unknown): EventHeader {
  return decode(EventHeader, input)
}
export function assertEventHeader(
  input: unknown,
): asserts input is EventHeader {
  decodeEventHeader(input)
}

export const EventPayload = strict(
  {
    data: unknown,
    header: EventHeader,
  },
  'EventPayload',
)
export type EventPayload<T = unknown> = {
  data: T
  header: EventHeader
}

// DagJWSResult in DID package
export const SignedEvent = sparse(
  {
    jws: DagJWS,
    linkedBlock: uint8array,
    cacaoBlock: optional(uint8array),
  },
  'SignedEvent',
)
export type SignedEvent = TypeOf<typeof SignedEvent>

export function decodeSignedEvent(input: unknown): SignedEvent {
  return decode(SignedEvent, input)
}
export function assertSignedEvent(
  input: unknown,
): asserts input is SignedEvent {
  decodeSignedEvent(input)
}

export const CeramicEvent = union([EventPayload, SignedEvent], 'CeramicEvent')
export type CeramicEvent = TypeOf<typeof CeramicEvent>

export function decodeCeramicEvent(input: unknown): CeramicEvent {
  return decode(CeramicEvent, input)
}
export function assertCeramicEvent(
  input: unknown,
): asserts input is CeramicEvent {
  decodeCeramicEvent(input)
}
