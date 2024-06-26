import type {
  ModelDefinition,
  ModelMetadata,
} from '@ceramic-sdk/model-protocol'
import type { DID } from 'dids'

export type ModelState = {
  content: ModelDefinition
  metadata: ModelMetadata
  log: [string, ...Array<string>]
}

export type InitContext = {
  getModelDefinition: (id: string) => Promise<ModelDefinition>
  verifier: DID
}

export type TimeContext = {
  getModelState: (cid: string) => Promise<ModelState>
}

export type Context = InitContext & TimeContext
