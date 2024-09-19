[**@ceramic-sdk/events v0.1.0**](../README.md) • **Docs**

***

[Ceramic SDK](../../../README.md) / [@ceramic-sdk/events](../README.md) / signEvent

# Function: signEvent()

> **signEvent**(`did`, `payload`, `options`?): `Promise`\<[`SignedEvent`](../type-aliases/SignedEvent.md)\>

Sign an event payload using the provided DID

## Parameters

• **did**: `DID`

• **payload**: `Record`\<`string`, `unknown`\>

• **options?**: `CreateJWSOptions`

## Returns

`Promise`\<[`SignedEvent`](../type-aliases/SignedEvent.md)\>

## Defined in

[packages/events/src/signing.ts:15](https://github.com/ceramicstudio/ceramic-sdk/blob/a220cbca7950f690af7f3d03a0023681bb9f5426/packages/events/src/signing.ts#L15)
