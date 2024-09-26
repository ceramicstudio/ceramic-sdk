[**@ceramic-sdk/model-instance-client v0.1.0**](../README.md) • **Docs**

***

[Ceramic SDK](../../../README.md) / [@ceramic-sdk/model-instance-client](../README.md) / createDataEventPayload

# Function: createDataEventPayload()

> **createDataEventPayload**(`current`, `data`, `header`?): [`DocumentDataEventPayload`](../../model-instance-protocol/type-aliases/DocumentDataEventPayload.md)

Create a data event payload for a ModelInstanceDocument stream

## Parameters

• **current**: [`CommitID`](../../identifiers/classes/CommitID.md)

• **data**: (`MapIn`\<`object`, `$TypeOf`\> \| `MapIn`\<`object`, `$TypeOf`\> \| `MapIn`\<`object`, `$TypeOf`\> \| `MapIn`\<`object`, `$TypeOf`\> \| `MapIn`\<`object`, `$TypeOf`\> \| `MapIn`\<`object`, `$TypeOf`\>)[]

• **header?**: `MapIn`\<`RequiredProps`\<`object`\>, `$TypeOf`\> & `MapIn`\<`OptionalProps`\<`object`\>, `$TypeOf`\>

## Returns

[`DocumentDataEventPayload`](../../model-instance-protocol/type-aliases/DocumentDataEventPayload.md)

## Defined in

[model-instance-client/src/events.ts:92](https://github.com/ceramicstudio/ceramic-sdk/blob/a220cbca7950f690af7f3d03a0023681bb9f5426/packages/model-instance-client/src/events.ts#L92)
