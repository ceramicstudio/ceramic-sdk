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

[packages/http-client/src/index.ts:21](https://github.com/ceramicstudio/ceramic-sdk/blob/945faad9ebf96fe9133cf555c12887003aaa32e5/packages/http-client/src/index.ts#L21)
