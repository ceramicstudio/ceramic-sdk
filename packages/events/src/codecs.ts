import { streamIDAsBytes } from '@ceramic-sdk/identifiers'
import { JWSSignature, cid, didString, uint8array } from '@didtools/codecs'
import {
  type TypeOf,
  array,
  boolean,
  decode,
  optional,
  sparse,
  string,
  tuple,
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

export const GenericEventHeader = sparse(
  {
    controllers: optional(tuple([didString])),
    model: optional(streamIDAsBytes),
    sep: optional(string),
    unique: optional(uint8array),
    context: optional(streamIDAsBytes),
    shouldIndex: optional(boolean),
  },
  'GenericEventHeader',
)
export type GenericEventHeader = TypeOf<typeof GenericEventHeader>

export const InitEventHeader = sparse(
  {
    controllers: tuple([didString]),
    model: streamIDAsBytes,
    sep: string,
    unique: optional(uint8array),
    context: optional(streamIDAsBytes),
    shouldIndex: optional(boolean),
  },
  'InitEventHeader',
)
export type InitEventHeader = TypeOf<typeof InitEventHeader>

export const InitEventPayload = sparse(
  {
    data: unknown,
    header: InitEventHeader,
  },
  'InitEventPayload',
)
export type InitEventPayload<T = unknown> = {
  data: T
  header: InitEventHeader
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
