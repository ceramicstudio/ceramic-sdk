[**@ceramic-sdk/model-instance-protocol v0.1.0**](../README.md) • **Docs**

***

[Ceramic SDK](../../../README.md) / [@ceramic-sdk/model-instance-protocol](../README.md) / DocumentDataEventPayload

# Variable: DocumentDataEventPayload

> `const` **DocumentDataEventPayload**: `SparseCodec`\<`object`\>

Data event payload for a ModelInstanceDocument Stream

## Type declaration

### data

> **data**: `Codec`\<(`MapIn`\<`object`, `$TypeOf`\> \| `MapIn`\<`object`, `$TypeOf`\> \| `MapIn`\<`object`, `$TypeOf`\> \| `MapIn`\<`object`, `$TypeOf`\> \| `MapIn`\<`object`, `$TypeOf`\> \| `MapIn`\<`object`, `$TypeOf`\>)[], (`MapIn`\<`object`, `$OutputOf`\> \| `MapIn`\<`object`, `$OutputOf`\> \| `MapIn`\<`object`, `$OutputOf`\> \| `MapIn`\<`object`, `$OutputOf`\> \| `MapIn`\<`object`, `$OutputOf`\> \| `MapIn`\<`object`, `$OutputOf`\>)[], `unknown`\> & `object`

### header

> **header**: `OptionalCodec`\<`SparseCodec`\<`object`\>\>

### id

> **id**: `Type`\<`CID`\<`unknown`, `number`, `number`, `Version`\>, `CID`\<`unknown`, `number`, `number`, `Version`\>, `unknown`\> = `cid`

### prev

> **prev**: `Type`\<`CID`\<`unknown`, `number`, `number`, `Version`\>, `CID`\<`unknown`, `number`, `number`, `Version`\>, `unknown`\> = `cid`

## Defined in

[packages/model-instance-protocol/src/codecs.ts:166](https://github.com/ceramicstudio/ceramic-sdk/blob/a220cbca7950f690af7f3d03a0023681bb9f5426/packages/model-instance-protocol/src/codecs.ts#L166)
