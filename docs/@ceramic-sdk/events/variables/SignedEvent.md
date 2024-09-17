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

###### Type declaration

###### item

> **item**: `ExactCodec`\<`TypeCodec`\<`object`\>\>

### linkedBlock

> **linkedBlock**: `TrivialCodec`\<`Uint8Array`\> = `uint8array`

## Defined in

[packages/events/src/codecs.ts:54](https://github.com/ceramicstudio/ceramic-sdk/blob/945faad9ebf96fe9133cf555c12887003aaa32e5/packages/events/src/codecs.ts#L54)
