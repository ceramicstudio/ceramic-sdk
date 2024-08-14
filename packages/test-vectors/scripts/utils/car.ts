import * as codec from '@ipld/dag-cbor'
import { type CAR, CARFactory, type IBlock } from 'cartonne'
import { sha256 } from 'multihashes-sync/sha2'

export const carFactory = new CARFactory()
carFactory.codecs.add(codec)
carFactory.hashers.add(sha256)

export function createCAR(
  blocks: Iterable<IBlock>,
  createBlocks: Record<string, unknown>,
  meta: Record<string, unknown> = {},
): CAR {
  const car = carFactory.build()
  for (const block of blocks) {
    car.blocks.put(block)
  }
  const rootValue = { ...meta }
  for (const [key, value] of Object.entries(createBlocks)) {
    rootValue[key] = car.put(value)
  }
  car.put(rootValue, { isRoot: true })
  return car
}
