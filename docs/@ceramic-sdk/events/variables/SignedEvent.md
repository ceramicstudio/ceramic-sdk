[**@ceramic-sdk/events v0.1.0**](../README.md) • **Docs**

***

[Ceramic SDK](../../../README.md) / [@ceramic-sdk/events](../README.md) / SignedEvent

# Variable: SignedEvent

> `const` **SignedEvent**: `SparseCodec`\<`object`\>

Signed event structure - equivalent to DagJWSResult in `dids` package

## Type declaration

### cacaoBlock

> **cacaoBlock**: `OptionalCodec`\<`TrivialCodec`\<`Uint8Array`\>\>

### jws

> **jws**: `SparseCodec`\<`object`\> = `DagJWS`

#### Type declaration

##### link

> **link**: `OptionalCodec`\<`Type`\<`CID`\<`unknown`, `number`, `number`, `Version`\>, `CID`\<`unknown`, `number`, `number`, `Version`\>, `unknown`\>\>

##### payload

> **payload**: `TrivialCodec`\<`string`\> = `string`

##### signatures

> **signatures**: `Codec`\<`MapIn`\<`object`, `$TypeOf`\>[], `MapIn`\<`object`, `$OutputOf`\>[], `unknown`\> & `object`

### linkedBlock

> **linkedBlock**: `TrivialCodec`\<`Uint8Array`\> = `uint8array`

## Defined in

[packages/events/src/codecs.ts:54](https://github.com/ceramicstudio/ceramic-sdk/blob/a220cbca7950f690af7f3d03a0023681bb9f5426/packages/events/src/codecs.ts#L54)
