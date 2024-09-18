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

[packages/http-client/src/index.ts:21](https://github.com/ceramicstudio/ceramic-sdk/blob/08d58118912aa26627dbf829b08a7b8bc9962e2e/packages/http-client/src/index.ts#L21)
