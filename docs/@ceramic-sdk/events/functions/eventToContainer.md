[**@ceramic-sdk/events v0.1.0**](../README.md) • **Docs**

***

[Ceramic SDK](../../../README.md) / [@ceramic-sdk/events](../README.md) / eventToContainer

# Function: eventToContainer()

> **eventToContainer**\<`Payload`\>(`did`, `codec`, `event`): `Promise`\<[`EventContainer`](../type-aliases/EventContainer.md)\<`Payload`\>\>

Decode a Ceramic event into a container using the provided verifier DID and payload decoder

## Type Parameters

• **Payload**

## Parameters

• **did**: `DID`

• **codec**: `Decoder`\<`unknown`, `Payload`\>

• **event**: `unknown`

## Returns

`Promise`\<[`EventContainer`](../type-aliases/EventContainer.md)\<`Payload`\>\>

## Defined in

[packages/events/src/container.ts:54](https://github.com/ceramicstudio/ceramic-sdk/blob/a220cbca7950f690af7f3d03a0023681bb9f5426/packages/events/src/container.ts#L54)
