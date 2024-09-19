[**@ceramic-sdk/model-protocol v0.1.0**](../README.md) • **Docs**

***

[Ceramic SDK](../../../README.md) / [@ceramic-sdk/model-protocol](../README.md) / ModelAccountRelationV2

# Variable: ModelAccountRelationV2

> `const` **ModelAccountRelationV2**: `UnionCodec`\<[`ExactCodec`\<`TypeCodec`\<`object`\>\>, `ExactCodec`\<`TypeCodec`\<`object`\>\>, `ExactCodec`\<`TypeCodec`\<`object`\>\>, `ExactCodec`\<`TypeCodec`\<`object`\>\>]\>

Represents the relationship between an instance of this model and the controller account:
- 'list' means there can be many instances of this model for a single account
- 'single' means there can be only one instance of this model per account (if a new instance is created it
overrides the old one)
- 'none' means there can be no instance associated to an account (for interfaces notably)
- 'set' means there can be only one instance of this model per account and value of the specified content 'fields'

## Defined in

[packages/model-protocol/src/codecs.ts:135](https://github.com/ceramicstudio/ceramic-sdk/blob/a220cbca7950f690af7f3d03a0023681bb9f5426/packages/model-protocol/src/codecs.ts#L135)
