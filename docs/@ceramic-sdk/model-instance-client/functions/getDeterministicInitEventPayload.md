[**@ceramic-sdk/model-instance-client v0.1.0**](../README.md) • **Docs**

***

[Ceramic SDK](../../../README.md) / [@ceramic-sdk/model-instance-client](../README.md) / getDeterministicInitEventPayload

# Function: getDeterministicInitEventPayload()

> **getDeterministicInitEventPayload**(`model`, `controller`, `uniqueValue`?): [`DeterministicInitEventPayload`](../../model-instance-protocol/type-aliases/DeterministicInitEventPayload.md)

Get a deterministic init event payload for a ModelInstanceDocument stream.

## Parameters

• **model**: [`StreamID`](../../identifiers/classes/StreamID.md)

• **controller**: `string` \| `string` & `WithOpaque`\<`"DIDString"`\>

• **uniqueValue?**: `Uint8Array`

## Returns

[`DeterministicInitEventPayload`](../../model-instance-protocol/type-aliases/DeterministicInitEventPayload.md)

## See

[createInitEvent](createInitEvent.md) for creating non-deterministic events.

## Defined in

[model-instance-client/src/events.ts:57](https://github.com/ceramicstudio/ceramic-sdk/blob/a220cbca7950f690af7f3d03a0023681bb9f5426/packages/model-instance-client/src/events.ts#L57)
