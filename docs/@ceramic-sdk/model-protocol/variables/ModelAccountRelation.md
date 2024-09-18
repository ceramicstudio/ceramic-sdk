[**@ceramic-sdk/model-protocol v0.1.0**](../README.md) • **Docs**

***

[Ceramic SDK](../../../README.md) / [@ceramic-sdk/model-protocol](../README.md) / ModelAccountRelation

# Variable: ModelAccountRelation

> `const` **ModelAccountRelation**: `UnionCodec`\<[`ExactCodec`\<`TypeCodec`\<`object`\>\>, `ExactCodec`\<`TypeCodec`\<`object`\>\>]\>

Represents the relationship between an instance of this model and the controller account.
'list' means there can be many instances of this model for a single account. 'single' means
there can be only one instance of this model per account (if a new instance is created it
overrides the old one).

## Defined in

[packages/model-protocol/src/codecs.ts:120](https://github.com/ceramicstudio/ceramic-sdk/blob/2df74ee449b4c48a3a1f531066c64854fe2dc5dd/packages/model-protocol/src/codecs.ts#L120)
