[**@ceramic-sdk/events v0.1.0**](../README.md) • **Docs**

***

[Ceramic SDK](../../../README.md) / [@ceramic-sdk/events](../README.md) / SignedEventContainer

# Type Alias: SignedEventContainer\<Payload\>

> **SignedEventContainer**\<`Payload`\>: `object`

Container for a signed Ceramic event

## Type Parameters

• **Payload**

## Type declaration

### cacaoBlock?

> `optional` **cacaoBlock**: `Uint8Array`

### cid

> **cid**: `CID`

### payload

> **payload**: `Payload`

### signed

> **signed**: `true`

### verified

> **verified**: `VerifyJWSResult`

## Defined in

[packages/events/src/container.ts:9](https://github.com/ceramicstudio/ceramic-sdk/blob/a220cbca7950f690af7f3d03a0023681bb9f5426/packages/events/src/container.ts#L9)
