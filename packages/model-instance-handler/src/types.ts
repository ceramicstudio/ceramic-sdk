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
  getDocumentModel: (id: string) => Promise<string>
  getDocumentState: (cid: string) => Promise<DocumentState>
  getModelDefinition: (id: string) => Promise<ModelDefinition>
  verifier: DID
}
