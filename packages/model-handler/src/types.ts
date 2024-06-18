import type { ModelDefinition, ModelState } from '@ceramic-sdk/model-protocol'
import type { DID } from 'dids'
import type { CID } from 'multiformats/cid'

export type InitContext = {
  getModelDefinition: (id: string) => Promise<ModelDefinition>
  verifier: DID
}

export type TimeContext = {
  getModelState: (cid: CID) => Promise<ModelState>
}

export type Context = InitContext & TimeContext
