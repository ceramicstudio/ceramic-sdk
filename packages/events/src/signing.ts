import { type DIDString, asDIDString } from '@didtools/codecs'
import * as dagCbor from '@ipld/dag-cbor'
import { type Decoder, decode } from 'codeco'
import type { CreateJWSOptions, DID } from 'dids'
import * as Block from 'multiformats/block'
import { sha256 } from 'multiformats/hashes/sha2'

import {
  type InitEventHeader,
  InitEventPayload,
  type SignedEvent,
} from './codecs.js'

/** Sign an event payload using the provided DID */
export async function signEvent(
  did: DID,
  payload: Record<string, unknown>,
  options?: CreateJWSOptions,
): Promise<SignedEvent> {
  if (!did.authenticated) {
    await did.authenticate()
  }
  const { linkedBlock, ...rest } = await did.createDagJWS(payload, options)
  return { ...rest, linkedBlock: new Uint8Array(linkedBlock) }
}

// Make controllers optional in the event header as createSignedEvent() will inject it as needed
export type PartialInitEventHeader = Omit<InitEventHeader, 'controllers'> & {
  controllers?: [DIDString]
}

/** Create a signed init event using the provided DID, data and header */
export async function createSignedInitEvent<T>(
  did: DID,
  data: T,
  header: PartialInitEventHeader,
  options?: CreateJWSOptions,
): Promise<SignedEvent> {
  if (!did.authenticated) {
    await did.authenticate()
  }
  const controllers = header.controllers ?? [
    asDIDString(did.hasParent ? did.parent : did.id),
  ]
  const payload = InitEventPayload.encode({
    data,
    header: { ...header, controllers },
  })
  return await signEvent(did, payload, options)
}

/** Decode the payload of a signed event using the provided decoder */
export async function getSignedEventPayload<Payload = Record<string, unknown>>(
  decoder: Decoder<unknown, Payload>,
  event: SignedEvent,
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
  return decode(decoder, block.value)
}
