import type { DocumentMetadata } from '@ceramic-sdk/model-instance-protocol'
import type { ModelDefinition } from '@ceramic-sdk/model-protocol'
import type { DID } from 'dids'

export type UnknowContent = Record<string, unknown>

export type DocumentState = {
  content: UnknowContent | null
  metadata: DocumentMetadata
  log: [string, ...Array<string>]
}

export type Context = {
  getDocumentModel: (streamID: string) => Promise<string>
  getDocumentState: (streamID: string) => Promise<DocumentState>
  getModelDefinition: (streamID: string) => Promise<ModelDefinition>
  verifier: DID
}
