import {
  type SignedEvent,
  eventFromCAR,
  signedEventToContainer,
} from '@ceramic-sdk/events'
import {
  DocumentDataEventPayload,
  DocumentInitEventPayload,
} from '@ceramic-sdk/model-instance-protocol'
import { Cacao } from '@didtools/cacao'
import { createDID } from '@didtools/key-did'
import { getEIP191Verifier } from '@didtools/pkh-ethereum'

import { loadCAR } from '../src/index.ts'

const verifier = createDID()

const [keyEd25519CAR, keyWebCryptoCAR, pkhEthereumCAR] = await Promise.all([
  loadCAR('key-ed25519'),
  loadCAR('key-webcrypto'),
  loadCAR('pkh-ethereum'),
])

describe('key-ed25519', () => {
  const root = keyEd25519CAR.get(keyEd25519CAR.roots[0])

  test('valid deterministic init event', () => {
    const cid = root.validDeterministicEvent
    const event = eventFromCAR(DocumentInitEventPayload, keyEd25519CAR, cid)
    expect(event).toBeDefined()
  })

  test('valid signed init event', async () => {
    const event = eventFromCAR(
      DocumentInitEventPayload,
      keyEd25519CAR,
      root.validInitEvent,
    ) as SignedEvent
    expect(event.jws.link.toString()).toBe(root.validInitPayload.toString())

    const container = await signedEventToContainer(
      verifier,
      DocumentInitEventPayload,
      event,
    )
    expect(container.signed).toBe(true)

    const did = container.verified.kid.split('#')[0]
    expect(did).toBe(root.controller)
  })

  test('valid data event', async () => {
    const event = eventFromCAR(
      DocumentDataEventPayload,
      keyEd25519CAR,
      root.validDataEvent,
    ) as SignedEvent
    expect(event.jws.link.toString()).toBe(root.validDataPayload.toString())

    const container = await signedEventToContainer(
      verifier,
      DocumentDataEventPayload,
      event,
    )
    expect(container.signed).toBe(true)

    const did = container.verified.kid.split('#')[0]
    expect(did).toBe(root.controller)
  })
})

describe('key-webcrypto', () => {
  const root = keyWebCryptoCAR.get(keyWebCryptoCAR.roots[0])

  test('valid deterministic init event', () => {
    const cid = root.validDeterministicEvent
    const event = eventFromCAR(DocumentInitEventPayload, keyWebCryptoCAR, cid)
    expect(event).toBeDefined()
  })

  test('valid signed init event', async () => {
    const event = eventFromCAR(
      DocumentInitEventPayload,
      keyWebCryptoCAR,
      root.validInitEvent,
    ) as SignedEvent
    expect(event.jws.link.toString()).toBe(root.validInitPayload.toString())

    const container = await signedEventToContainer(
      verifier,
      DocumentInitEventPayload,
      event,
    )
    expect(container.signed).toBe(true)

    const did = container.verified.kid.split('#')[0]
    expect(did).toBe(root.controller)
  })

  test('valid data event', async () => {
    const event = eventFromCAR(
      DocumentDataEventPayload,
      keyWebCryptoCAR,
      root.validDataEvent,
    ) as SignedEvent
    expect(event.jws.link.toString()).toBe(root.validDataPayload.toString())

    const container = await signedEventToContainer(
      verifier,
      DocumentDataEventPayload,
      event,
    )
    expect(container.signed).toBe(true)

    const did = container.verified.kid.split('#')[0]
    expect(did).toBe(root.controller)
  })
})

describe('pkh-ethereum', () => {
  const root = pkhEthereumCAR.get(pkhEthereumCAR.roots[0])
  const verifiers = getEIP191Verifier()

  test('valid deterministic init event', () => {
    const cid = root.validDeterministicEvent
    const event = eventFromCAR(DocumentInitEventPayload, pkhEthereumCAR, cid)
    expect(event).toBeDefined()
  })

  test('valid signed init event', async () => {
    const event = eventFromCAR(
      DocumentInitEventPayload,
      pkhEthereumCAR,
      root.validInitEvent,
    ) as SignedEvent
    expect(event.jws.link.toString()).toBe(root.validInitPayload.toString())

    const container = await signedEventToContainer(
      verifier,
      DocumentInitEventPayload,
      event,
    )
    expect(container.signed).toBe(true)

    // biome-ignore lint/style/noNonNullAssertion: existing value
    const capability = await Cacao.fromBlockBytes(container.cacaoBlock!)
    const verified = await verifier.verifyJWS(event.jws, {
      capability,
      issuer: root.controller,
      verifiers,
    })
    expect(verified).toBeDefined()
  })

  test('valid data event', async () => {
    const event = eventFromCAR(
      DocumentDataEventPayload,
      pkhEthereumCAR,
      root.validDataEvent,
    ) as SignedEvent
    expect(event.jws.link.toString()).toBe(root.validDataPayload.toString())

    const container = await signedEventToContainer(
      verifier,
      DocumentDataEventPayload,
      event,
    )
    expect(container.signed).toBe(true)

    // biome-ignore lint/style/noNonNullAssertion: existing value
    const capability = await Cacao.fromBlockBytes(container.cacaoBlock!)
    const verified = await verifier.verifyJWS(event.jws, {
      capability,
      issuer: root.controller,
      verifiers,
    })
    expect(verified).toBeDefined()
  })
})
