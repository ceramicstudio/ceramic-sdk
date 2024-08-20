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
import { getSolanaVerifier } from '@didtools/pkh-solana'
import type { CAR } from 'cartonne'

import {
  type ArchiveRootContentCommon,
  type ArchiveRootContentWithCapability,
  type ArchiveRootContentWithoutCapability,
  loadCAR,
} from '../src/index.ts'

const EXPECTED_EXPIRED_DATE = new Date(2000, 0).toISOString()

const verifier = createDID()

const [keyP256CAR, keyEd25519CAR, pkhEthereumCAR, pkhSolanaCAR] =
  await Promise.all([
    loadCAR('key-ecdsa-p256'),
    loadCAR('key-ed25519'),
    loadCAR('pkh-ethereum'),
    loadCAR('pkh-solana'),
  ])

// Tests applying to any DID type

describe.each([
  ['key-ecdsa-p256', keyP256CAR],
  ['key-ed25519', keyEd25519CAR],
  ['pkh-ethereum', pkhEthereumCAR],
  ['pkh-solana', pkhSolanaCAR],
])('common checks using %s', (controllerType: string, car: CAR) => {
  const root = car.get(car.roots[0]) as ArchiveRootContentCommon

  test('valid deterministic init event', () => {
    const cid = root.validDeterministicEvent
    const event = eventFromCAR(DocumentInitEventPayload, car, cid)
    expect(event).toBeDefined()
  })

  test('invalid signature of signed init event', async () => {
    const event = eventFromCAR(
      DocumentInitEventPayload,
      car,
      root.invalidInitEventSignature,
    ) as SignedEvent
    expect(event.jws.link.toString()).toBe(root.validInitPayload.toString())

    await expect(async () => {
      await signedEventToContainer(verifier, DocumentInitEventPayload, event)
    }).rejects.toThrow('invalid_signature: Signature invalid for JWT')
  })

  test('invalid signature of signed data event', async () => {
    const event = eventFromCAR(
      DocumentDataEventPayload,
      car,
      root.invalidDataEventSignature,
    ) as SignedEvent
    expect(event.jws.link.toString()).toBe(root.validDataPayload.toString())

    await expect(async () => {
      await signedEventToContainer(verifier, DocumentDataEventPayload, event)
    }).rejects.toThrow('invalid_signature: Signature invalid for JWT')
  })
})

// Tests applying only to DIDs signing payloads directly

describe.each([
  ['key-ecdsa-p256', keyP256CAR],
  ['key-ed25519', keyEd25519CAR],
])('direct signatures using %s', (controllerType: string, car: CAR) => {
  const root = car.get(car.roots[0]) as ArchiveRootContentWithoutCapability

  test('valid signed init event', async () => {
    const event = eventFromCAR(
      DocumentInitEventPayload,
      car,
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
      car,
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

// Tests applying only to DIDs using CACAO

describe.each([
  ['pkh-ethereum', pkhEthereumCAR, getEIP191Verifier()],
  ['pkh-solana', pkhSolanaCAR, getSolanaVerifier()],
])(
  'CACAO signatures using %s',
  (controllerType: string, car: CAR, verifiers) => {
    const root = car.get(car.roots[0]) as ArchiveRootContentWithCapability

    test('valid signed init event', async () => {
      const event = eventFromCAR(
        DocumentInitEventPayload,
        car,
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

    test('expired signed init event capability', async () => {
      const event = eventFromCAR(
        DocumentInitEventPayload,
        car,
        root.expiredInitEventCapability,
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
      expect(capability.p.exp).toBe(EXPECTED_EXPIRED_DATE)
    })

    test('invalid signed init event capability', async () => {
      const event = eventFromCAR(
        DocumentInitEventPayload,
        car,
        root.invalidInitEventCapabilitySignature,
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
      await expect(async () => {
        await Cacao.verify(capability, { verifiers })
      }).rejects.toThrow()
    })

    test('valid data event', async () => {
      const event = eventFromCAR(
        DocumentDataEventPayload,
        car,
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

    test('expired data event capability', async () => {
      const event = eventFromCAR(
        DocumentDataEventPayload,
        car,
        root.expiredDataEventCapability,
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
      expect(capability.p.exp).toBe(EXPECTED_EXPIRED_DATE)
    })

    test('invalid data event capability', async () => {
      const event = eventFromCAR(
        DocumentDataEventPayload,
        car,
        root.invalidDataEventCapabilitySignature,
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
      await expect(async () => {
        await Cacao.verify(capability, { verifiers })
      }).rejects.toThrow()
    })
  },
)
