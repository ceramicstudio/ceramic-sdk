import type { ModelSnapshot } from '@ceramic-sdk/stream-model'
import type { DID } from '@ceramic-sdk/types'

export type Context = {
  loadModel: (id: string) => Promise<ModelSnapshot>
  verifier: DID
}
