[**@ceramic-sdk/http-client v0.1.0**](../README.md) • **Docs**

***

[Ceramic SDK](../../../README.md) / [@ceramic-sdk/http-client](../README.md) / ClientParams

# Type Alias: ClientParams

> **ClientParams**: `object`

## Type declaration

### fetch()?

> `optional` **fetch**: (`request`) => `ReturnType`\<*typeof* `fetch`\>

Custom fetch function to use for requests

#### Parameters

• **request**: `Request`

#### Returns

`ReturnType`\<*typeof* `fetch`\>

### headers?

> `optional` **headers**: `HeadersOptions`

Additional HTTP headers to send with requests

### url

> **url**: `string`

Ceramic One server URL

## Defined in

[packages/http-client/src/index.ts:21](https://github.com/ceramicstudio/ceramic-sdk/blob/a220cbca7950f690af7f3d03a0023681bb9f5426/packages/http-client/src/index.ts#L21)
