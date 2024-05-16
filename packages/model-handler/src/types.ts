import type { ModelDefinition } from '@ceramic-sdk/model-protocol'
import type { DID } from 'dids'

export type Context = {
  loadModelDefinition: (id: string) => Promise<ModelDefinition>
  verifier: DID
}
