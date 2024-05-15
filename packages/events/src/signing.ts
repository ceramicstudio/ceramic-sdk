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

export async function signEvent(
  did: DID,
  payload: EventPayload,
): Promise<SignedEvent> {
  return await did.createDagJWS(payload)
}

// Make controllers optional in the event header as createSignedEvent() will inject it as needed
export type PartialEventHeader = Omit<EventHeader, 'controllers'> & {
  controllers?: [string]
}

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
  return await signEvent(did, { data, header: { ...header, controllers } })
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
