import { type DIDString, asDIDString } from '@didtools/codecs'
import * as dagCbor from '@ipld/dag-cbor'
import { type Decoder, decode } from 'codeco'
import type { DID, VerifyJWSResult } from 'dids'
import * as Block from 'multiformats/block'
import { sha256 } from 'multiformats/hashes/sha2'

import { type EventHeader, EventPayload, type SignedEvent } from './codecs.js'

export type VerifiedEvent<Payload = EventPayload<unknown>> = VerifyJWSResult &
  Payload & {
    cacaoBlock?: Uint8Array
  }

export async function signEvent(
  did: DID,
  payload: EventPayload,
): Promise<SignedEvent> {
  const encodedPayload = EventPayload.encode(payload)
  const { linkedBlock, ...rest } = await did.createDagJWS(encodedPayload)
  return { ...rest, linkedBlock: new Uint8Array(linkedBlock) }
}

// Make controllers optional in the event header as createSignedEvent() will inject it as needed
export type PartialEventHeader = Omit<EventHeader, 'controllers'> & {
  controllers?: [DIDString]
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
    asDIDString(did.hasParent ? did.parent : did.id),
  ]
  return await signEvent(did, { data, header: { ...header, controllers } })
}

export async function getSignedEventPayload<Payload = EventPayload>(
  event: SignedEvent,
  codec: Decoder<unknown, unknown> = EventPayload,
): Promise<Payload> {
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
  return decode(codec, block.value) as Payload
}

export async function verifyEvent<Payload = EventPayload>(
  did: DID,
  event: SignedEvent,
  codec?: Decoder<unknown, unknown>,
): Promise<VerifiedEvent<Payload>> {
  const cid = event.jws.link
  if (cid == null) {
    throw new Error('Missing linked block CID')
  }
  const [verified, payload] = await Promise.all([
    did.verifyJWS(event.jws),
    getSignedEventPayload<Payload>(event, codec),
  ])
  return { ...verified, ...payload, cacaoBlock: event.cacaoBlock }
}
