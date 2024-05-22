import { streamIDAsBytes, streamIDAsString } from '@ceramic-sdk/identifiers'
import {
  cid,
  didString,
  uint8ArrayAsBase64,
  uint8array,
} from '@didtools/codecs'
import {
  type TypeOf,
  array,
  boolean,
  literal,
  nullCodec,
  optional,
  sparse,
  strict,
  string,
  tuple,
  union,
  unknown,
  unknownRecord,
} from 'codeco'
import 'multiformats' // Import needed for TS reference
import 'ts-essentials' // Import needed for TS reference

/**
 * JSON patch operations.
 */

export const JSONPatchAddOperation = strict(
  {
    op: literal('add'),
    path: string,
    value: unknown,
  },
  'JSONPatchAddOperation',
)

export const JSONPatchRemoveOperation = strict(
  {
    op: literal('remove'),
    path: string,
  },
  'JSONPatchRemoveOperation',
)

export const JSONPatchReplaceOperation = strict(
  {
    op: literal('replace'),
    path: string,
    value: unknown,
  },
  'JSONPatchReplaceOperation',
)

export const JSONPatchMoveOperation = strict(
  {
    op: literal('move'),
    path: string,
    from: string,
  },
  'JSONPatchMoveOperation',
)

export const JSONPatchCopyOperation = strict(
  {
    op: literal('copy'),
    path: string,
    from: string,
  },
  'JSONPatchCopyOperation',
)

export const JSONPatchTestOperation = strict(
  {
    op: literal('test'),
    path: string,
    value: unknown,
  },
  'JSONPatchTestOperation',
)

export const JSONPatchOperation = union(
  [
    JSONPatchAddOperation,
    JSONPatchRemoveOperation,
    JSONPatchReplaceOperation,
    JSONPatchMoveOperation,
    JSONPatchCopyOperation,
    JSONPatchTestOperation,
  ],
  'JSONPatchOperation',
)
export type JSONPatchOperation = TypeOf<typeof JSONPatchOperation>

/**
 * Init event header for a ModelInstanceDocument Stream
 */
export const DocumentInitEventHeader = sparse(
  {
    controllers: tuple([didString]),
    model: streamIDAsBytes,
    sep: literal('model'),
    unique: optional(uint8array),
    context: optional(streamIDAsBytes),
    shouldIndex: optional(boolean),
  },
  'DocumentInitEventHeader',
)
export type DocumentInitEventHeader = TypeOf<typeof DocumentInitEventHeader>

/**
 * Init event payload for a ModelInstanceDocument Stream
 */
export const DocumentInitEventPayload = sparse(
  {
    data: unknownRecord,
    header: DocumentInitEventHeader,
  },
  'DocumentInitEventPayload',
)
export type DocumentInitEventPayload = TypeOf<typeof DocumentInitEventPayload>

/**
 * Init event header for a deterministic ModelInstanceDocument Stream
 */
export const DeterministicInitEventHeader = sparse(
  {
    controllers: tuple([didString]),
    model: streamIDAsBytes,
    sep: literal('model'),
    unique: optional(uint8array),
  },
  'DeterministicInitEventHeader',
)
export type DeterministicInitEventHeader = TypeOf<
  typeof DeterministicInitEventHeader
>

/**
 * Init event payload for a deterministic ModelInstanceDocument Stream
 */
export const DeterministicInitEventPayload = sparse(
  {
    data: nullCodec,
    header: DeterministicInitEventHeader,
  },
  'DeterministicInitEventPayload',
)
export type DeterministicInitEventPayload = TypeOf<
  typeof DeterministicInitEventPayload
>

/**
 * Data event header for a ModelInstanceDocument Stream
 */
export const DocumentDataEventHeader = sparse(
  {
    context: optional(streamIDAsBytes),
    shouldIndex: optional(boolean),
  },
  'DocumentDataEventHeader',
)
export type DocumentDataEventHeader = TypeOf<typeof DocumentDataEventHeader>

/**
 * Data event payload for a ModelInstanceDocument Stream
 */
export const DocumentDataEventPayload = sparse(
  {
    data: array(JSONPatchOperation),
    prev: cid,
    id: cid,
    header: optional(DocumentDataEventHeader),
  },
  'DocumentDataEventPayload',
)
export type DocumentDataEventPayload = TypeOf<typeof DocumentDataEventPayload>

/**
 * Metadata for a ModelInstanceDocument Stream
 */
export const DocumentMetadata = sparse(
  {
    /**
     * The DID that is allowed to author updates to this ModelInstanceDocument
     */
    controller: didString,
    /**
     * The StreamID of the Model that this ModelInstanceDocument belongs to.
     */
    model: streamIDAsString,
    /**
     * Unique bytes
     */
    unique: optional(uint8ArrayAsBase64),
    /**
     * The "context" StreamID for this ModelInstanceDocument.
     */
    context: optional(streamIDAsString),
    /**
     * Whether the stream should be indexed or not.
     */
    shouldIndex: optional(boolean),
  },
  'DocumentMetadata',
)
export type DocumentMetadata = TypeOf<typeof DocumentMetadata>
