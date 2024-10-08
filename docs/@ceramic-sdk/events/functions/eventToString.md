[**@ceramic-sdk/events v0.1.0**](../README.md) • **Docs**

***

[Ceramic SDK](../../../README.md) / [@ceramic-sdk/events](../README.md) / eventToString

# Function: eventToString()

> **eventToString**(`codec`, `event`, `base`?): `string`

Encode an event into a string using the provided codec for unsigned events and the given base (defaults to base64)

## Parameters

• **codec**: `Codec`\<`unknown`, `unknown`, `unknown`\>

• **event**: `unknown`

• **base?**: `"base64url"` \| `"base256emoji"` \| `"base64"` \| `"base64pad"` \| `"base64urlpad"` \| `"base58btc"` \| `"base58flickr"` \| `"base36"` \| `"base36upper"` \| `"base32"` \| `"base32upper"` \| `"base32pad"` \| `"base32padupper"` \| `"base32hex"` \| `"base32hexupper"` \| `"base32hexpad"` \| `"base32hexpadupper"` \| `"base32z"` \| `"base16"` \| `"base16upper"` \| `"base10"` \| `"base8"` \| `"base2"` \| `"identity"`

## Returns

`string`

## Defined in

[packages/events/src/encoding.ts:89](https://github.com/ceramicstudio/ceramic-sdk/blob/a220cbca7950f690af7f3d03a0023681bb9f5426/packages/events/src/encoding.ts#L89)
