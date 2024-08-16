import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import * as cborCodec from '@ipld/dag-cbor'
import * as jsonCodec from '@ipld/dag-json'
import { type CAR, CARFactory } from 'cartonne'
import * as joseCodec from 'dag-jose'
import { sha256 } from 'multihashes-sync/sha2'

const CONTROLLER_TYPES = {
  'key-ed25519': true,
  'key-webcrypto': true,
  'pkh-ethereum': true,
}

export type ControllerType = keyof typeof CONTROLLER_TYPES

export function getCARPath(type: ControllerType): string {
  if (CONTROLLER_TYPES[type] == null) {
    throw new Error(`Unsupported CAR path: ${type}`)
  }
  const url = new URL(`../assets/${type}.car`, import.meta.url)
  return fileURLToPath(url)
}

export const carFactory = new CARFactory()
carFactory.codecs.add(cborCodec)
carFactory.codecs.add(jsonCodec)
carFactory.codecs.add(joseCodec)
carFactory.hashers.add(sha256)

export async function loadCAR(type: ControllerType): Promise<CAR> {
  const bytes = await readFile(getCARPath(type))
  return carFactory.fromBytes(bytes)
}
