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

const [keyPlainCAR, pkhEthereumCAR] = await Promise.all([
  loadCAR('key-plain'),
  loadCAR('pkh-ethereum'),
])

describe('key-plain', () => {
  const root = keyPlainCAR.get(keyPlainCAR.roots[0])

  test('valid deterministic init event', () => {
    const cid = root.validDeterministicEvent
    const event = eventFromCAR(DocumentInitEventPayload, keyPlainCAR, cid)
    expect(event).toBeDefined()
  })

  test('valid signed init event', async () => {
    const event = eventFromCAR(
      DocumentInitEventPayload,
      keyPlainCAR,
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
      keyPlainCAR,
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
