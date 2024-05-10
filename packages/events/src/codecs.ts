import type { AnyEvent, EventPayload, SignedEvent } from '@ceramic-sdk/types'
import * as dagJson from '@ipld/dag-json'
import { type CAR, CARFactory, CarBlock } from 'cartonne'
import * as dagJose from 'dag-jose'
import { bases } from 'multiformats/basics'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multihashes-sync/sha2'

import {
  base64urlToJSON,
  isJWS,
  isSignedEvent,
  restrictBlockSize,
} from './utils.js'

const carFactory = new CARFactory()
carFactory.codecs.add(dagJose)
carFactory.codecs.add(dagJson)
carFactory.hashers.add(sha256)

export type Base = keyof typeof bases

export const DEFAULT_BASE: Base = 'base64url'

export function signedEventToCAR(event: SignedEvent): CAR {
  const { jws, linkedBlock, cacaoBlock } = event
  const car = carFactory.build()

  // if cacao is present, put it into ipfs dag
  if (cacaoBlock != null) {
    const header = base64urlToJSON<{ cap: string }>(jws.signatures[0].protected)
    const capCID = CID.parse(header.cap.replace('ipfs://', ''))
    car.blocks.put(new CarBlock(capCID, cacaoBlock))
    restrictBlockSize(cacaoBlock, capCID)
  }

  const payloadCID = jws.link
  if (payloadCID != null) {
    // Encode payload
    car.blocks.put(new CarBlock(payloadCID, linkedBlock))
    restrictBlockSize(linkedBlock, payloadCID)
  }

  // Encode JWS itself
  const cid = car.put(jws, {
    codec: 'dag-jose',
    hasher: 'sha2-256',
    isRoot: true,
  })
  // biome-ignore lint/style/noNonNullAssertion: added to CAR file right before
  const cidBlock = car.blocks.get(cid)!.payload
  restrictBlockSize(cidBlock, cid)

  return car
}

export function unsignedEventToCAR(event: EventPayload): CAR {
  const car = carFactory.build()
  const cid = car.put(event, { isRoot: true })
  // biome-ignore lint/style/noNonNullAssertion: added to CAR file right before
  const cidBlock = car.blocks.get(cid)!.payload
  restrictBlockSize(cidBlock, cid)
  return car
}

export function eventToCAR(event: AnyEvent): CAR {
  return isSignedEvent(event)
    ? signedEventToCAR(event)
    : unsignedEventToCAR(event)
}

export function eventToString(
  event: AnyEvent,
  base: Base = DEFAULT_BASE,
): string {
  return eventToCAR(event).toString(base)
}

export function eventFromCAR(car: CAR): AnyEvent {
  const cid = car.roots[0]
  const root = car.get(cid)

  if (isJWS(root)) {
    const linkedBlock = root.link
      ? car.blocks.get(root.link)?.payload
      : undefined
    if (linkedBlock == null) {
      throw new Error('Linked block not found')
    }
    const event: SignedEvent = { jws: root, linkedBlock }
    const header = base64urlToJSON<{ cap?: string }>(
      root.signatures[0].protected,
    )
    if (header.cap != null) {
      const capCID = CID.parse(header.cap.replace('ipfs://', ''))
      event.cacaoBlock = car.blocks.get(capCID)?.payload
    }
    return event
  }

  return root
}

export function eventFromString(
  value: string,
  base: Base = DEFAULT_BASE,
): AnyEvent {
  const codec = bases[base]
  if (codec == null) {
    throw new Error(`Unsupported base: ${base}`)
  }
  const car = carFactory.fromBytes(codec.decode(value))
  return eventFromCAR(car)
}
