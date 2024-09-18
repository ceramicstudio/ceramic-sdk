[**@ceramic-sdk/events v0.1.0**](../README.md) • **Docs**

***

[Ceramic SDK](../../../README.md) / [@ceramic-sdk/events](../README.md) / getSignedEventPayload

# Function: getSignedEventPayload()

> **getSignedEventPayload**\<`Payload`\>(`decoder`, `event`): `Promise`\<`Payload`\>

Decode the payload of a signed event using the provided decoder

## Type Parameters

• **Payload** = `Record`\<`string`, `unknown`\>

## Parameters

• **decoder**: `Decoder`\<`unknown`, `Payload`\>

• **event**: `MapIn`\<`RequiredProps`\<`object`\>, `$TypeOf`\> & `MapIn`\<`OptionalProps`\<`object`\>, `$TypeOf`\>

## Returns

`Promise`\<`Payload`\>

## Defined in

[packages/events/src/signing.ts:53](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/events/src/signing.ts#L53)
