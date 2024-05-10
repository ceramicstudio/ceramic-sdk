import type {
  DID,
  EventHeader,
  EventPayload,
  SignedEvent,
  VerifiedEvent,
} from '@ceramic-sdk/types'
import * as dagCbor from '@ipld/dag-cbor'
import * as Block from 'multiformats/block'
import { sha256 } from 'multiformats/hashes/sha2'

const DEFAULT_SEP = 'model'

export async function signEvent(
  did: DID,
  payload: EventPayload,
): Promise<SignedEvent> {
  return await did.createDagJWS(payload)
}

export type PartialEventHeader = Partial<EventHeader> & { model: Uint8Array }

export async function createSignedEvent<T>(
  did: DID,
  data: T,
  header: PartialEventHeader,
): Promise<SignedEvent> {
  if (!did.authenticated) {
    await did.authenticate()
  }
  const controllers = header.controllers ?? [
    did.hasParent ? did.parent : did.id,
  ]
  const sep = header.sep ?? DEFAULT_SEP
  return await signEvent(did, { data, header: { ...header, controllers, sep } })
}

export async function getSignedEventPayload<T = unknown>(
  event: SignedEvent,
): Promise<EventPayload<T>> {
  const cid = event.jws.link
  if (cid == null) {
    throw new Error('Missing linked block CID')
  }
  const block = await Block.create({
    bytes: event.linkedBlock,
    cid,
    codec: dagCbor,
    hasher: sha256,
  })
  return block.value as EventPayload<T>
}

export async function verifyEvent<T = unknown>(
  did: DID,
  event: SignedEvent,
): Promise<VerifiedEvent<T>> {
  const cid = event.jws.link
  if (cid == null) {
    throw new Error('Missing linked block CID')
  }
  const [verified, payload] = await Promise.all([
    did.verifyJWS(event.jws),
    getSignedEventPayload<T>(event),
  ])
  return { ...verified, ...payload, cacaoBlock: event.cacaoBlock }
}
