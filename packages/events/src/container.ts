import { type Decoder, decode } from 'codeco'
import type { DID, VerifyJWSResult } from 'dids'

import { SignedEvent } from './codecs.js'
import { getSignedEventPayload } from './signing.js'

export type SignedEventContainer<Payload> = {
  signed: true
  payload: Payload
  verified: VerifyJWSResult
  cacaoBlock?: Uint8Array
}

export type UnsignedEventContainer<Payload> = {
  signed: false
  payload: Payload
}

export type EventContainer<Payload> =
  | SignedEventContainer<Payload>
  | UnsignedEventContainer<Payload>

export function unsignedEventToContainer<Payload>(
  codec: Decoder<unknown, Payload>,
  event: unknown,
): UnsignedEventContainer<Payload> {
  return { signed: false, payload: decode(codec, event) }
}

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
  return { signed: true, verified, payload, cacaoBlock: event.cacaoBlock }
}

export async function eventToContainer<Payload>(
  did: DID,
  codec: Decoder<unknown, Payload>,
  event: unknown,
): Promise<EventContainer<Payload>> {
  return SignedEvent.is(event)
    ? await signedEventToContainer(did, codec, event)
    : unsignedEventToContainer(codec, event)
}
