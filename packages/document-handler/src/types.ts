import type { DocumentMetadata } from '@ceramic-sdk/document-protocol'
import type { ModelDefinition } from '@ceramic-sdk/model-protocol'
import type { DID } from 'dids'

export type UnknowContent = Record<string, unknown>

export type EncodedMetadata = ReturnType<typeof DocumentMetadata.encode>

export type DocumentSnapshot = {
  content: UnknowContent | null
  metadata: EncodedMetadata
}

export type DocumentState = DocumentSnapshot & {
  id: string
  log: Array<unknown> // TODO: events
}

export type Context = {
  loadDocument: (id: string) => Promise<DocumentSnapshot>
  loadModelDefinition: (id: string) => Promise<ModelDefinition>
  verifier: DID
}
