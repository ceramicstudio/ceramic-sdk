[**@ceramic-sdk/events v0.1.0**](../README.md) • **Docs**

***

[Ceramic SDK](../../../README.md) / [@ceramic-sdk/events](../README.md) / InitEventHeader

# Variable: InitEventHeader

> `const` **InitEventHeader**: `SparseCodec`\<`object`\>

Header structure of Init events

## Type declaration

### context

> **context**: `OptionalCodec`\<`Type`\<[`StreamID`](../../identifiers/classes/StreamID.md), `Uint8Array`, `Uint8Array`\>\>

### controllers

> **controllers**: `TupleCodec`\<[`RefinementCodec`\<`TrivialCodec`\<`string`\>, `string` & `WithOpaque`\<`"DIDString"`\>\>]\>

### model

> **model**: `Type`\<[`StreamID`](../../identifiers/classes/StreamID.md), `Uint8Array`, `Uint8Array`\> = `streamIDAsBytes`

### sep

> **sep**: `TrivialCodec`\<`string`\> = `string`

### shouldIndex

> **shouldIndex**: `OptionalCodec`\<`TrivialCodec`\<`boolean`\>\>

### unique

> **unique**: `OptionalCodec`\<`TrivialCodec`\<`Uint8Array`\>\>

## Defined in

[packages/events/src/codecs.ts:27](https://github.com/ceramicstudio/ceramic-sdk/blob/2df74ee449b4c48a3a1f531066c64854fe2dc5dd/packages/events/src/codecs.ts#L27)
