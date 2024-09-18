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

[packages/events/src/container.ts:37](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/events/src/container.ts#L37)
