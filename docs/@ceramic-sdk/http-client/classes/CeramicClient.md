[**@ceramic-sdk/http-client v0.1.0**](../README.md) • **Docs**

***

[Ceramic SDK](../../../README.md) / [@ceramic-sdk/http-client](../README.md) / CeramicClient

# Class: CeramicClient

## Constructors

### new CeramicClient()

> **new CeramicClient**(`params`): [`CeramicClient`](CeramicClient.md)

#### Parameters

• **params**: [`ClientParams`](../type-aliases/ClientParams.md)

#### Returns

[`CeramicClient`](CeramicClient.md)

#### Defined in

[packages/http-client/src/index.ts:40](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/http-client/src/index.ts#L40)

## Accessors

### api

> `get` **api**(): `Client`\<`paths`, \`$\{string\}/$\{string\}\`\>

OpenAPI client used internally, provides low-level access to the HTTP APIs exposed by the Ceramic One server

#### Returns

`Client`\<`paths`, \`$\{string\}/$\{string\}\`\>

#### Defined in

[packages/http-client/src/index.ts:49](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/http-client/src/index.ts#L49)

## Methods

### getEvent()

> **getEvent**(`id`): `Promise`\<`object`\>

Get the raw event response for the given event CID

#### Parameters

• **id**: `string`

#### Returns

`Promise`\<`object`\>

##### data?

> `optional` **data**: `string`

###### Description

Multibase encoding of event data.

##### id

> **id**: `string`

###### Description

Multibase encoding of event root CID bytes.

#### Defined in

[packages/http-client/src/index.ts:54](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/http-client/src/index.ts#L54)

***

### getEventCAR()

> **getEventCAR**(`id`): `Promise`\<`CAR`\>

Get the CAR-encoded event for the given event CID

#### Parameters

• **id**: `string`

#### Returns

`Promise`\<`CAR`\>

#### Defined in

[packages/http-client/src/index.ts:74](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/http-client/src/index.ts#L74)

***

### getEventData()

> **getEventData**(`id`): `Promise`\<`string`\>

Get the string-encoded event for the given event CID

#### Parameters

• **id**: `string`

#### Returns

`Promise`\<`string`\>

#### Defined in

[packages/http-client/src/index.ts:65](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/http-client/src/index.ts#L65)

***

### getEventsFeed()

> **getEventsFeed**(`params`): `Promise`\<`object`\>

Get the events feed based on the given parameters

#### Parameters

• **params**: [`EventsFeedParams`](../type-aliases/EventsFeedParams.md) = `{}`

#### Returns

`Promise`\<`object`\>

##### events

> **events**: `object`[]

###### Description

An array of events. For now, the event data payload is empty.

##### resumeToken

> **resumeToken**: `string`

###### Description

The token/highwater mark to used as resumeAt on a future request

#### Defined in

[packages/http-client/src/index.ts:89](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/http-client/src/index.ts#L89)

***

### getEventType()

> **getEventType**\<`Payload`\>(`decoder`, `id`): `Promise`\<`Payload` \| `MapIn`\<`RequiredProps`\<`object`\>, `$TypeOf`\> & `MapIn`\<`OptionalProps`\<`object`\>, `$TypeOf`\>\>

Get the decoded event for the given decoder and event CID

#### Type Parameters

• **Payload**

#### Parameters

• **decoder**: `Decoder`\<`unknown`, `Payload`\>

• **id**: `string`

#### Returns

`Promise`\<`Payload` \| `MapIn`\<`RequiredProps`\<`object`\>, `$TypeOf`\> & `MapIn`\<`OptionalProps`\<`object`\>, `$TypeOf`\>\>

#### Defined in

[packages/http-client/src/index.ts:80](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/http-client/src/index.ts#L80)

***

### getVersion()

> **getVersion**(): `Promise`\<`object`\>

Get information about the Ceramic One server version

#### Returns

`Promise`\<`object`\>

##### version?

> `optional` **version**: `string`

###### Description

Version of the Ceramic node

#### Defined in

[packages/http-client/src/index.ts:102](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/http-client/src/index.ts#L102)

***

### postEvent()

> **postEvent**(`data`): `Promise`\<`void`\>

Post a string-encoded event to the server

#### Parameters

• **data**: `string`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/http-client/src/index.ts:111](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/http-client/src/index.ts#L111)

***

### postEventCAR()

> **postEventCAR**(`car`): `Promise`\<`CID`\<`unknown`, `number`, `number`, `Version`\>\>

Post a CAR-encoded event to the server

#### Parameters

• **car**: `CAR`

#### Returns

`Promise`\<`CID`\<`unknown`, `number`, `number`, `Version`\>\>

#### Defined in

[packages/http-client/src/index.ts:119](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/http-client/src/index.ts#L119)

***

### postEventType()

> **postEventType**(`codec`, `event`): `Promise`\<`CID`\<`unknown`, `number`, `number`, `Version`\>\>

Encode and post an event to the server

#### Parameters

• **codec**: `Codec`\<`unknown`, `unknown`, `unknown`\>

• **event**: `unknown`

#### Returns

`Promise`\<`CID`\<`unknown`, `number`, `number`, `Version`\>\>

#### Defined in

[packages/http-client/src/index.ts:125](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/http-client/src/index.ts#L125)

***

### registerInterestModel()

> **registerInterestModel**(`model`): `Promise`\<`void`\>

Register interest in streams using the given model stream ID

#### Parameters

• **model**: `string`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/http-client/src/index.ts:131](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/http-client/src/index.ts#L131)
