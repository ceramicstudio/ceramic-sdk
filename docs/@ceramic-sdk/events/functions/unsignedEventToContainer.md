[**@ceramic-sdk/events v0.1.0**](../README.md) • **Docs**

***

[Ceramic SDK](../../../README.md) / [@ceramic-sdk/events](../README.md) / unsignedEventToContainer

# Function: unsignedEventToContainer()

> **unsignedEventToContainer**\<`Payload`\>(`codec`, `event`): [`UnsignedEventContainer`](../type-aliases/UnsignedEventContainer.md)\<`Payload`\>

Decode an unsigned Ceramic event into a container using the provided payload decoder

## Type Parameters

• **Payload**

## Parameters

• **codec**: `Decoder`\<`unknown`, `Payload`\>

• **event**: `unknown`

## Returns

[`UnsignedEventContainer`](../type-aliases/UnsignedEventContainer.md)\<`Payload`\>

## Defined in

[packages/events/src/container.ts:29](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/events/src/container.ts#L29)
