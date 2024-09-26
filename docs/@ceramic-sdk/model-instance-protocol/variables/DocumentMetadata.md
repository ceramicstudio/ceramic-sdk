[**@ceramic-sdk/model-instance-protocol v0.1.0**](../README.md) • **Docs**

***

[Ceramic SDK](../../../README.md) / [@ceramic-sdk/model-instance-protocol](../README.md) / DocumentMetadata

# Variable: DocumentMetadata

> `const` **DocumentMetadata**: `SparseCodec`\<`object`\>

Metadata for a ModelInstanceDocument Stream

## Type declaration

### context

> **context**: `OptionalCodec`\<`Type`\<[`StreamID`](../../identifiers/classes/StreamID.md), `string`, `string`\>\>

The "context" StreamID for this ModelInstanceDocument.

### controller

> **controller**: `RefinementCodec`\<`TrivialCodec`\<`string`\>, `string` & `WithOpaque`\<`"DIDString"`\>\> = `didString`

The DID that is allowed to author updates to this ModelInstanceDocument

### model

> **model**: `Type`\<[`StreamID`](../../identifiers/classes/StreamID.md), `string`, `string`\> = `streamIDAsString`

The StreamID of the Model that this ModelInstanceDocument belongs to.

### shouldIndex

> **shouldIndex**: `OptionalCodec`\<`TrivialCodec`\<`boolean`\>\>

Whether the stream should be indexed or not.

### unique

> **unique**: `OptionalCodec`\<`Type`\<`Uint8Array`, `string`, `string`\>\>

Unique bytes

## Defined in

[packages/model-instance-protocol/src/codecs.ts:180](https://github.com/ceramicstudio/ceramic-sdk/blob/a220cbca7950f690af7f3d03a0023681bb9f5426/packages/model-instance-protocol/src/codecs.ts#L180)
