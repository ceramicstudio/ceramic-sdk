const SHARED_JWK = {
  ext: true,
  kty: 'EC',
  x: 'O-xQi9-EwhpwQT3bCxgzYoD4hmBtwZSourf9-lokltU',
  y: 'LqPnHu_70X9BE6AM2bVNtxncG7T0W44jSbvd7CbeKlo',
  crv: 'P-256',
}
const PRIVATE_JWK = {
  ...SHARED_JWK,
  key_ops: ['sign'],
  d: 'YMbt7DF46-IRKwgKJZcvLaBQYfz6nY4Ts7eAI8ybFXk',
}
const PUBLIC_JWK = {
  ...SHARED_JWK,
  key_ops: ['verify'],
}

async function getKey(jwk, usage: KeyUsage): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    [usage],
  )
}

export async function getKeyPair(): Promise<CryptoKeyPair> {
  const [privateKey, publicKey] = await Promise.all([
    getKey(PRIVATE_JWK, 'sign'),
    getKey(PUBLIC_JWK, 'verify'),
  ])
  return { privateKey, publicKey }
}
