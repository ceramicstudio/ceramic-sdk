import type { DocumentMetadata } from '@ceramic-sdk/document-protocol'
import type { ModelDefinition } from '@ceramic-sdk/model-protocol'
import type { DID } from 'dids'
import type { CID } from 'multiformats/cid'

export type UnknowContent = Record<string, unknown>

export type DocumentState = {
  content: UnknowContent | null
  metadata: DocumentMetadata
  log: [CID, ...Array<CID>]
}

export type Context = {
  getDocumentModel: (id: string) => Promise<string>
  getDocumentState: (cid: CID) => Promise<DocumentState>
  getModelDefinition: (id: string) => Promise<ModelDefinition>
  verifier: DID
}
