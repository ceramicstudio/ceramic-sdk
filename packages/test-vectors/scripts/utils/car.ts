import * as codec from '@ipld/dag-cbor'
import { type CAR, CARFactory } from 'cartonne'
import { sha256 } from 'multihashes-sync/sha2'

const carFactory = new CARFactory()

export function createCAR(data: unknown): CAR {
  const car = carFactory.build()
  car.put(data, { codec, hasher: sha256, isRoot: true })
  return car
}
