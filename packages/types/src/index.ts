export type { CAR } from 'cartonne'
export type {
  DagJWS,
  DagJWSResult as SignedEvent,
  DID,
  JWSSignature,
} from 'dids'
export type { CID } from 'multiformats/cid'

export type EventHeader = {
  controllers: [string]
  model: Uint8Array
  sep: string
  unique?: Uint8Array
}
