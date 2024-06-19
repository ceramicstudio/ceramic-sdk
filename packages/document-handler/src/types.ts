import type {
  DeterministicInitEventPayload,
  DocumentDataEventPayload,
  DocumentInitEventPayload,
  DocumentMetadata,
} from '@ceramic-sdk/document-protocol'
import type { TimeEvent } from '@ceramic-sdk/events'
import type { ModelDefinition } from '@ceramic-sdk/model-protocol'
import type { DID } from 'dids'
import type { CID } from 'multiformats/cid'

export type InitEventPayload =
  | DeterministicInitEventPayload
  | DocumentInitEventPayload
export type ChangeEventPayload = DocumentDataEventPayload | TimeEvent

export type UnknowContent = Record<string, unknown>

export type DocumentSnapshot = {
  content: UnknowContent | null
  metadata: DocumentMetadata
}

export type DocumentState = DocumentSnapshot & {
  cid: CID
  log: [InitEventPayload, ...Array<ChangeEventPayload>]
}

export type Context = {
  getDocumentSnapshot: (id: string) => Promise<DocumentSnapshot>
  getDocumentState: (cid: CID) => Promise<DocumentState>
  getModelDefinition: (id: string) => Promise<ModelDefinition>
  verifier: DID
}
