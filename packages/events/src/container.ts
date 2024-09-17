import { type Decoder, decode } from 'codeco'
import type { DID, VerifyJWSResult } from 'dids'
import type { CID } from 'multiformats/cid'

import { SignedEvent } from './codecs.js'
import { getSignedEventPayload } from './signing.js'

/** Container for a signed Ceramic event */
export type SignedEventContainer<Payload> = {
  signed: true
  cid: CID
  payload: Payload
  verified: VerifyJWSResult
  cacaoBlock?: Uint8Array
}

/** Container for an unsigned Ceramic event */
export type UnsignedEventContainer<Payload> = {
  signed: false
  payload: Payload
}

/** Container for a Ceramic event, providing additional metadata about the event */
export type EventContainer<Payload> =
  | SignedEventContainer<Payload>
  | UnsignedEventContainer<Payload>

/** Decode an unsigned Ceramic event into a container using the provided payload decoder */
export function unsignedEventToContainer<Payload>(
  codec: Decoder<unknown, Payload>,
  event: unknown,
): UnsignedEventContainer<Payload> {
  return { signed: false, payload: decode(codec, event) }
}

/** Decode a signed Ceramic event into a container using the provided verifier DID and payload decoder */
export async function signedEventToContainer<Payload>(
  did: DID,
  codec: Decoder<unknown, Payload>,
  event: SignedEvent,
): Promise<SignedEventContainer<Payload>> {
  const cid = event.jws.link
  if (cid == null) {
    throw new Error('Missing linked block CID')
  }
  const [verified, payload] = await Promise.all([
    did.verifyJWS(event.jws),
    getSignedEventPayload(codec, event),
  ])
  return { signed: true, cid, verified, payload, cacaoBlock: event.cacaoBlock }
}

/** Decode a Ceramic event into a container using the provided verifier DID and payload decoder */
export async function eventToContainer<Payload>(
  did: DID,
  codec: Decoder<unknown, Payload>,
  event: unknown,
): Promise<EventContainer<Payload>> {
  return SignedEvent.is(event)
    ? await signedEventToContainer(did, codec, event)
    : unsignedEventToContainer(codec, event)
}
