[**@ceramic-sdk/identifiers v0.1.0**](../README.md) • **Docs**

***

[Ceramic SDK](../../../README.md) / [@ceramic-sdk/identifiers](../README.md) / StreamID

# Class: StreamID

Stream identifier, no commit information included.

Contains stream type and CID of genesis commit.

Encoded as `<multibase-prefix><multicodec-streamid><type><genesis-cid-bytes>`.

String representation is base36-encoding of the bytes above.

## Constructors

### new StreamID()

> **new StreamID**(`type`, `cid`): [`StreamID`](StreamID.md)

Create a new StreamID.

#### Parameters

• **type**: [`StreamType`](../type-aliases/StreamType.md)

the stream type

• **cid**: `string` \| `CID`\<`unknown`, `number`, `number`, `Version`\>

#### Returns

[`StreamID`](StreamID.md)

#### Example

```typescript
new StreamID('MID', 'bagcqcerakszw2vsovxznyp5gfnpdj4cqm2xiv76yd24wkjewhhykovorwo6a');
new StreamID('MID', cid);
new StreamID(3, cid);
```

#### Defined in

[stream-id.ts:106](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/stream-id.ts#L106)

## Properties

### \_tag

> `protected` `readonly` **\_tag**: `symbol` = `TAG`

#### Defined in

[stream-id.ts:73](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/stream-id.ts#L73)

***

### fromBytes()

> `static` **fromBytes**: (`bytes`) => [`StreamID`](StreamID.md)

Parse StreamID from bytes representation.

#### Parameters

• **bytes**: `Uint8Array`

bytes representation of StreamID.

#### Returns

[`StreamID`](StreamID.md)

#### Throws

error on invalid input

#### See

StreamID#bytes

#### Defined in

[stream-id.ts:78](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/stream-id.ts#L78)

***

### fromString()

> `static` **fromString**: (`input`) => [`StreamID`](StreamID.md)

Parse StreamID from string representation.

#### Parameters

• **input**: `string`

string representation of StreamID, be it base36-encoded string or URL.

#### Returns

[`StreamID`](StreamID.md)

#### See

 - StreamID#toString
 - StreamID#toUrl

#### Defined in

[stream-id.ts:79](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/stream-id.ts#L79)

## Accessors

### baseID

> `get` **baseID**(): [`StreamID`](StreamID.md)

Copy of self. Exists to maintain compatibility with CommitID.

#### Returns

[`StreamID`](StreamID.md)

#### Defined in

[stream-id.ts:170](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/stream-id.ts#L170)

***

### bytes

> `get` **bytes**(): `Uint8Array`

Bytes representation of StreamID.

#### Returns

`Uint8Array`

#### Defined in

[stream-id.ts:160](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/stream-id.ts#L160)

***

### cid

> `get` **cid**(): `CID`\<`unknown`, `number`, `number`, `Version`\>

Genesis commits CID

#### Returns

`CID`\<`unknown`, `number`, `number`, `Version`\>

#### Defined in

[stream-id.ts:152](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/stream-id.ts#L152)

***

### type

> `get` **type**(): [`StreamTypeCode`](../type-aliases/StreamTypeCode.md)

Stream type code

#### Returns

[`StreamTypeCode`](../type-aliases/StreamTypeCode.md)

#### Defined in

[stream-id.ts:137](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/stream-id.ts#L137)

***

### typeName

> `get` **typeName**(): `"tile"` \| `"caip10-link"` \| `"model"` \| `"MID"` \| `"UNLOADABLE"`

Stream type name

#### Returns

`"tile"` \| `"caip10-link"` \| `"model"` \| `"MID"` \| `"UNLOADABLE"`

#### Defined in

[stream-id.ts:145](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/stream-id.ts#L145)

## Methods

### equals()

> **equals**(`other`): `boolean`

Compare equality with another StreamID.

#### Parameters

• **other**: [`StreamID`](StreamID.md)

#### Returns

`boolean`

#### Defined in

[stream-id.ts:177](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/stream-id.ts#L177)

***

### toString()

> **toString**(): `string`

Encode the StreamID into a string.

#### Returns

`string`

#### Defined in

[stream-id.ts:187](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/stream-id.ts#L187)

***

### toUrl()

> **toUrl**(): `string`

Encode the StreamID into a base36 url.

#### Returns

`string`

#### Defined in

[stream-id.ts:195](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/stream-id.ts#L195)

***

### fromPayload()

> `static` **fromPayload**(`type`, `value`): [`StreamID`](StreamID.md)

Create a streamId from an init event payload.

#### Parameters

• **type**: [`StreamType`](../type-aliases/StreamType.md)

the stream type

• **value**: `unknown`

the init event payload

#### Returns

[`StreamID`](StreamID.md)

#### Example

```typescript
const streamId = StreamID.fromPayload('MID', {
  header: {
    controllers: ['did:3:kjz...'],
    model: '...',
  }
});
```

#### Defined in

[stream-id.ts:130](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/stream-id.ts#L130)

***

### isInstance()

> `static` **isInstance**(`instance`): `instance is StreamID`

#### Parameters

• **instance**: `unknown`

#### Returns

`instance is StreamID`

#### Defined in

[stream-id.ts:84](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/stream-id.ts#L84)
