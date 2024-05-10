import type { DagJWSResult as SignedEvent, VerifyJWSResult } from 'dids'

export type { CAR } from 'cartonne'
export type { DagJWS, DID, JWSSignature } from 'dids'
export type { CID } from 'multiformats/cid'

export type { SignedEvent }

export type EventHeader = {
  controllers: [string]
  model: Uint8Array
  sep: string
  unique?: Uint8Array
}

export type EventPayload<T = unknown> = {
  data: T
  header: EventHeader
}

export type AnyEvent = EventPayload<unknown> | SignedEvent

export type VerifiedEvent<T = unknown> = VerifyJWSResult &
  EventPayload<T> & {
    cacaoBlock?: Uint8Array
  }
