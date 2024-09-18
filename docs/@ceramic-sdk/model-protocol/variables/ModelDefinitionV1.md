[**@ceramic-sdk/model-protocol v0.1.0**](../README.md) • **Docs**

***

[Ceramic SDK](../../../README.md) / [@ceramic-sdk/model-protocol](../README.md) / ModelDefinitionV1

# Variable: ModelDefinitionV1

> `const` **ModelDefinitionV1**: `SparseCodec`\<`object`\>

## Type declaration

### accountRelation

> **accountRelation**: `UnionCodec`\<[`ExactCodec`\<`TypeCodec`\<`object`\>\>, `ExactCodec`\<`TypeCodec`\<`object`\>\>]\> = `ModelAccountRelation`

### description

> **description**: `OptionalCodec`\<`TrivialCodec`\<`string`\>\>

### name

> **name**: `TrivialCodec`\<`string`\> = `string`

### relations

> **relations**: `OptionalCodec`\<`NonEnumerableRecordCodec`\<`TrivialCodec`\<`string`\>, `UnionCodec`\<[`ExactCodec`\<`TypeCodec`\<`object`\>\>, `ExactCodec`\<`TypeCodec`\<`object`\>\>]\>\>\>

### schema

> **schema**: `Type`\<`Object`\<`any`\>, `Object`\<`any`\>, `unknown`\> = `ObjectSchema`

### version

> **version**: `LiteralCodec`\<`"1.0"`\>

### views

> **views**: `OptionalCodec`\<`NonEnumerableRecordCodec`\<`TrivialCodec`\<`string`\>, `UnionCodec`\<[`UnionCodec`\<[`ExactCodec`\<`TypeCodec`\<`object`\>\>, `ExactCodec`\<`TypeCodec`\<`object`\>\>]\>, `UnionCodec`\<[`ExactCodec`\<`TypeCodec`\<`object`\>\>, `ExactCodec`\<`TypeCodec`\<`object`\>\>, `ExactCodec`\<`TypeCodec`\<`object`\>\>]\>]\>\>\>

## Defined in

[packages/model-protocol/src/codecs.ts:328](https://github.com/ceramicstudio/ceramic-sdk/blob/2df74ee449b4c48a3a1f531066c64854fe2dc5dd/packages/model-protocol/src/codecs.ts#L328)
