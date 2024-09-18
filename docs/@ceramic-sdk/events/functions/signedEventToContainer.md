[**@ceramic-sdk/events v0.1.0**](../README.md) • **Docs**

***

[Ceramic SDK](../../../README.md) / [@ceramic-sdk/events](../README.md) / signedEventToContainer

# Function: signedEventToContainer()

> **signedEventToContainer**\<`Payload`\>(`did`, `codec`, `event`): `Promise`\<[`SignedEventContainer`](../type-aliases/SignedEventContainer.md)\<`Payload`\>\>

Decode a signed Ceramic event into a container using the provided verifier DID and payload decoder

## Type Parameters

• **Payload**

## Parameters

• **did**: `DID`

• **codec**: `Decoder`\<`unknown`, `Payload`\>

• **event**: `MapIn`\<`RequiredProps`\<`object`\>, `$TypeOf`\> & `MapIn`\<`OptionalProps`\<`object`\>, `$TypeOf`\>

## Returns

`Promise`\<[`SignedEventContainer`](../type-aliases/SignedEventContainer.md)\<`Payload`\>\>

## Defined in

[packages/events/src/container.ts:37](https://github.com/ceramicstudio/ceramic-sdk/blob/2df74ee449b4c48a3a1f531066c64854fe2dc5dd/packages/events/src/container.ts#L37)
