[**@ceramic-sdk/events v0.1.0**](../README.md) • **Docs**

***

[Ceramic SDK](../../../README.md) / [@ceramic-sdk/events](../README.md) / InitEventHeader

# Variable: InitEventHeader

> `const` **InitEventHeader**: `SparseCodec`\<`object`\>

Header structure of Init events

## Type declaration

### context

> **context**: `OptionalCodec`\<`Type`\<`StreamID`, `Uint8Array`, `Uint8Array`\>\>

### controllers

> **controllers**: `TupleCodec`\<[`RefinementCodec`\<`TrivialCodec`\<`string`\>, `string` & `WithOpaque`\<`"DIDString"`\>\>]\>

### model

> **model**: `Type`\<`StreamID`, `Uint8Array`, `Uint8Array`\> = `streamIDAsBytes`

### sep

> **sep**: `TrivialCodec`\<`string`\> = `string`

### shouldIndex

> **shouldIndex**: `OptionalCodec`\<`TrivialCodec`\<`boolean`\>\>

### unique

> **unique**: `OptionalCodec`\<`TrivialCodec`\<`Uint8Array`\>\>

## Defined in

[packages/events/src/codecs.ts:27](https://github.com/ceramicstudio/ceramic-sdk/blob/945faad9ebf96fe9133cf555c12887003aaa32e5/packages/events/src/codecs.ts#L27)
