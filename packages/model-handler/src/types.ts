import type { ModelDefinition } from '@ceramic-sdk/model-protocol'
import type { DID } from '@ceramic-sdk/types'

export type Context = {
  loadModelDefinition: (id: string) => Promise<ModelDefinition>
  verifier: DID
}
