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

[packages/events/src/signing.ts:15](https://github.com/ceramicstudio/ceramic-sdk/blob/2df74ee449b4c48a3a1f531066c64854fe2dc5dd/packages/events/src/signing.ts#L15)
