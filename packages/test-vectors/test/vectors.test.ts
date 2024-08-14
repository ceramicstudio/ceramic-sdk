import {
  type SignedEvent,
  eventFromCAR,
  signedEventToContainer,
} from '@ceramic-sdk/events'
import {
  DocumentDataEventPayload,
  DocumentInitEventPayload,
} from '@ceramic-sdk/model-instance-protocol'
import { createDID } from '@didtools/key-did'

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
  })
})
