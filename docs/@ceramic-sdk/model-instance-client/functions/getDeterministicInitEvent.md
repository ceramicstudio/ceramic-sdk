[**@ceramic-sdk/model-instance-client v0.1.0**](../README.md) • **Docs**

***

[Ceramic SDK](../../../README.md) / [@ceramic-sdk/model-instance-client](../README.md) / getDeterministicInitEvent

# Function: getDeterministicInitEvent()

> **getDeterministicInitEvent**(`model`, `controller`, `uniqueValue`?): [`EncodedDeterministicInitEventPayload`](../../model-instance-protocol/type-aliases/EncodedDeterministicInitEventPayload.md)

Get an encoded deterministic init event for a ModelInstanceDocument stream

## Parameters

• **model**: [`StreamID`](../../identifiers/classes/StreamID.md)

• **controller**: `string` \| `string` & `WithOpaque`\<`"DIDString"`\>

• **uniqueValue?**: `Uint8Array`

## Returns

[`EncodedDeterministicInitEventPayload`](../../model-instance-protocol/type-aliases/EncodedDeterministicInitEventPayload.md)

## Defined in

[model-instance-client/src/events.ts:75](https://github.com/ceramicstudio/ceramic-sdk/blob/a220cbca7950f690af7f3d03a0023681bb9f5426/packages/model-instance-client/src/events.ts#L75)
