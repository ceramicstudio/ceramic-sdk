[**@ceramic-sdk/model-instance-protocol v0.1.0**](../README.md) • **Docs**

***

[Ceramic SDK](../../../README.md) / [@ceramic-sdk/model-instance-protocol](../README.md) / DeterministicInitEventPayload

# Variable: DeterministicInitEventPayload

> `const` **DeterministicInitEventPayload**: `SparseCodec`\<`object`\>

Init event payload for a deterministic ModelInstanceDocument Stream

## Type declaration

### data

> **data**: `TrivialCodec`\<`null`\> = `nullCodec`

### header

> **header**: `SparseCodec`\<`object`\> = `DocumentInitEventHeader`

#### Type declaration

##### context

> **context**: `OptionalCodec`\<`Type`\<[`StreamID`](../../identifiers/classes/StreamID.md), `Uint8Array`, `Uint8Array`\>\>

##### controllers

> **controllers**: `TupleCodec`\<[`RefinementCodec`\<`TrivialCodec`\<`string`\>, `string` & `WithOpaque`\<`"DIDString"`\>\>]\>

##### model

> **model**: `Type`\<[`StreamID`](../../identifiers/classes/StreamID.md), `Uint8Array`, `Uint8Array`\> = `streamIDAsBytes`

##### sep

> **sep**: `LiteralCodec`\<`"model"`\>

##### shouldIndex

> **shouldIndex**: `OptionalCodec`\<`TrivialCodec`\<`boolean`\>\>

##### unique

> **unique**: `OptionalCodec`\<`TrivialCodec`\<`Uint8Array`\>\>

## Defined in

[packages/model-instance-protocol/src/codecs.ts:129](https://github.com/ceramicstudio/ceramic-sdk/blob/a220cbca7950f690af7f3d03a0023681bb9f5426/packages/model-instance-protocol/src/codecs.ts#L129)
