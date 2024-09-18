[**@ceramic-sdk/identifiers v0.1.0**](../README.md) • **Docs**

***

[Ceramic SDK](../../../README.md) / [@ceramic-sdk/identifiers](../README.md) / CommitID

# Class: CommitID

Commit identifier, includes type, init CID, commit CID.

Encoded as `<multibase-prefix><multicodec-streamid><type><init-cid-bytes><commit-cid-bytes>`.

String representation is base36-encoding of the bytes above.

## Constructors

### new CommitID()

> **new CommitID**(`type`, `cid`, `commit`): [`CommitID`](CommitID.md)

Create a new StreamID.

#### Parameters

• **type**: [`StreamType`](../type-aliases/StreamType.md)

• **cid**: `string` \| `CID`\<`unknown`, `number`, `number`, `Version`\>

• **commit**: `null` \| `string` \| `number` \| `CID`\<`unknown`, `number`, `number`, `Version`\> = `null`

CID. Pass '0', 0, or omit the value as shorthand for the init commit.

#### Returns

[`CommitID`](CommitID.md)

#### Example

```ts
new StreamID(<type>, <CID>|<cidStr>)
new StreamID(<type>, <CID>|<cidStr>, <CommitCID>|<CommitCidStr>)
```

#### Defined in

[commit-id.ts:121](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/commit-id.ts#L121)

## Properties

### \_tag

> `protected` `readonly` **\_tag**: `symbol` = `TAG`

#### Defined in

[commit-id.ts:79](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/commit-id.ts#L79)

***

### fromBytes()

> `static` **fromBytes**: (`bytes`) => [`CommitID`](CommitID.md)

Parse CommitID from bytes representation.

#### Parameters

• **bytes**: `Uint8Array`

bytes representation of CommitID.

#### Returns

[`CommitID`](CommitID.md)

#### Throws

error on invalid input

#### See

CommitID#bytes

#### Defined in

[commit-id.ts:85](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/commit-id.ts#L85)

***

### fromString()

> `static` **fromString**: (`input`) => [`CommitID`](CommitID.md)

Parse CommitID from string representation.

#### Parameters

• **input**: `string`

string representation of CommitID, be it base36-encoded string or URL.

#### Returns

[`CommitID`](CommitID.md)

#### See

 - CommitID#toString
 - CommitID#toUrl

#### Defined in

[commit-id.ts:86](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/commit-id.ts#L86)

## Accessors

### baseID

> `get` **baseID**(): [`StreamID`](StreamID.md)

Construct StreamID, no commit information included

#### Returns

[`StreamID`](StreamID.md)

#### Defined in

[commit-id.ts:137](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/commit-id.ts#L137)

***

### bytes

> `get` **bytes**(): `Uint8Array`

Bytes representation

#### Returns

`Uint8Array`

#### Defined in

[commit-id.ts:175](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/commit-id.ts#L175)

***

### cid

> `get` **cid**(): `CID`\<`unknown`, `number`, `number`, `Version`\>

Genesis CID

#### Returns

`CID`\<`unknown`, `number`, `number`, `Version`\>

#### Defined in

[commit-id.ts:159](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/commit-id.ts#L159)

***

### commit

> `get` **commit**(): `CID`\<`unknown`, `number`, `number`, `Version`\>

Commit CID

#### Returns

`CID`\<`unknown`, `number`, `number`, `Version`\>

#### Defined in

[commit-id.ts:167](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/commit-id.ts#L167)

***

### type

> `get` **type**(): [`StreamTypeCode`](../type-aliases/StreamTypeCode.md)

Stream type code

#### Returns

[`StreamTypeCode`](../type-aliases/StreamTypeCode.md)

#### Defined in

[commit-id.ts:144](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/commit-id.ts#L144)

***

### typeName

> `get` **typeName**(): `"tile"` \| `"caip10-link"` \| `"model"` \| `"MID"` \| `"UNLOADABLE"`

Stream type name

#### Returns

`"tile"` \| `"caip10-link"` \| `"model"` \| `"MID"` \| `"UNLOADABLE"`

#### Defined in

[commit-id.ts:152](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/commit-id.ts#L152)

## Methods

### equals()

> **equals**(`other`): `boolean`

Compare equality with another CommitID.

#### Parameters

• **other**: [`CommitID`](CommitID.md)

#### Returns

`boolean`

#### Defined in

[commit-id.ts:186](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/commit-id.ts#L186)

***

### toString()

> **toString**(): `string`

Encode the CommitID into a string.

#### Returns

`string`

#### Defined in

[commit-id.ts:198](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/commit-id.ts#L198)

***

### toUrl()

> **toUrl**(): `string`

Encode the StreamID into a base36 url

#### Returns

`string`

#### Defined in

[commit-id.ts:206](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/commit-id.ts#L206)

***

### fromStream()

> `static` **fromStream**(`stream`, `commit`): [`CommitID`](CommitID.md)

Construct new CommitID for a given stream and commit

#### Parameters

• **stream**: [`StreamID`](StreamID.md)

• **commit**: `null` \| `string` \| `number` \| `CID`\<`unknown`, `number`, `number`, `Version`\> = `null`

#### Returns

[`CommitID`](CommitID.md)

#### Defined in

[commit-id.ts:91](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/commit-id.ts#L91)

***

### isInstance()

> `static` **isInstance**(`instance`): `instance is CommitID`

#### Parameters

• **instance**: `unknown`

#### Returns

`instance is CommitID`

#### Defined in

[commit-id.ts:101](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/identifiers/src/commit-id.ts#L101)
