import { DagJWS } from '@didtools/codecs'
import * as dagJson from '@ipld/dag-json'
import { type CAR, CARFactory, CarBlock } from 'cartonne'
import { type Codec, type Decoder, decode } from 'codeco'
import * as dagJose from 'dag-jose'
import { bases } from 'multiformats/basics'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multihashes-sync/sha2'

import { SignedEvent } from './codecs.js'
import { base64urlToJSON, restrictBlockSize } from './utils.js'

const carFactory = new CARFactory()
carFactory.codecs.add(dagJose)
carFactory.codecs.add(dagJson)
carFactory.hashers.add(sha256)

export type Base = keyof typeof bases

export const DEFAULT_BASE: Base = 'base64'

export function carToString(car: CAR, base: Base = DEFAULT_BASE): string {
  return car.toString(base)
}

export function carFromString(value: string, base: Base = DEFAULT_BASE): CAR {
  const codec = bases[base]
  if (codec == null) {
    throw new Error(`Unsupported base: ${base}`)
  }
  return carFactory.fromBytes(codec.decode(value))
}

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

export function encodeEventToCAR(codec: Codec<unknown>, event: unknown): CAR {
  const car = carFactory.build()
  const cid = car.put(codec.encode(event), { isRoot: true })
  // biome-ignore lint/style/noNonNullAssertion: added to CAR file right before
  const cidBlock = car.blocks.get(cid)!.payload
  restrictBlockSize(cidBlock, cid)
  return car
}

export function eventToCAR(codec: Codec<unknown>, event: unknown): CAR {
  return SignedEvent.is(event)
    ? signedEventToCAR(event)
    : encodeEventToCAR(codec, event)
}

export function eventToString(
  codec: Codec<unknown>,
  event: unknown,
  base?: Base,
): string {
  return carToString(eventToCAR(codec, event), base)
}

export function eventFromCAR<Payload = unknown>(
  decoder: Decoder<unknown, Payload>,
  car: CAR,
  eventCID?: CID,
): SignedEvent | Payload {
  const cid = eventCID ?? car.roots[0]
  const root = car.get(cid)

  if (DagJWS.is(root)) {
    const linkedBlock = root.link
      ? car.blocks.get(root.link)?.payload
      : undefined
    if (linkedBlock == null) {
      throw new Error('Linked block not found')
    }
    const event = decode(SignedEvent, { jws: root, linkedBlock })
    const header = base64urlToJSON<{ cap?: string }>(
      root.signatures[0].protected,
    )
    if (header.cap != null) {
      const capCID = CID.parse(header.cap.replace('ipfs://', ''))
      event.cacaoBlock = car.blocks.get(capCID)?.payload
    }
    return event
  }

  return decode(decoder, root)
}

export function eventFromString<Payload = unknown>(
  decoder: Decoder<unknown, Payload>,
  value: string,
  base?: Base,
): SignedEvent | Payload {
  return eventFromCAR(decoder, carFromString(value, base))
}
