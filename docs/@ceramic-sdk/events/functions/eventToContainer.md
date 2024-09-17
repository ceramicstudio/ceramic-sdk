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

[packages/events/src/container.ts:54](https://github.com/ceramicstudio/ceramic-sdk/blob/945faad9ebf96fe9133cf555c12887003aaa32e5/packages/events/src/container.ts#L54)
