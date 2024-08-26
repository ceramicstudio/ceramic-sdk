import {
  InitEventPayload,
  type SignedEvent,
  signEvent,
  signedEventToCAR,
} from '@ceramic-sdk/events'
import { CommitID, StreamID } from '@ceramic-sdk/identifiers'
import {
  createDataEventPayload,
  createInitHeader,
  getDeterministicInitEvent,
} from '@ceramic-sdk/model-instance-client'
import { getStreamID } from '@ceramic-sdk/model-instance-protocol'
import type { Cacao } from '@didtools/cacao'
import type { IBlock } from 'cartonne'
import type { CreateJWSOptions, DID } from 'dids'

import type { ControllerType } from '../src/index.ts'

import { createCAR } from './utils/car.ts'
import {
  createCapabilityDID,
  createExpiredCapabilityDID,
  keyDID,
} from './utils/did.ts'
import { getAuthMethod as getEthereumAuth } from './utils/ethereum.ts'
import { writeCARFile } from './utils/fs.ts'
import { getAuthMethod as getSolanaAuth } from './utils/solana.ts'
import { getP256KeyDID } from './utils/webcrypto.ts'

function changeEventSignature(event: SignedEvent): SignedEvent {
  const [firstSignature, ...otherSignatures] = event.jws.signatures
  return {
    ...event,
    jws: {
      ...event.jws,
      signatures: [
        {
          ...firstSignature,
          signature: `${firstSignature.signature.slice(0, -4)}AAAA`,
        },
        ...otherSignatures,
      ],
    },
  }
}

function changeCapabilitySignature(cacao: Cacao): Cacao {
  // biome-ignore lint/style/noNonNullAssertion: existing value
  const signature = cacao.s!
  return { ...cacao, s: { ...signature, s: `${signature.s.slice(0, -4)}AAAA` } }
}

const model = StreamID.fromString(
  'k2t6wz4z9kggqqnbn3vqggh2z4fe9jctr9vvbc1em2yho0qnzzrtzz1n2hr4lq',
)

type Controller = {
  id: string
  signer: DID
} & ({ withCapability: false } | { withCapability: true; expiredSigner: DID })

const controllerFactories = {
  'key-ecdsa-p256': async () => {
    const signer = await getP256KeyDID()
    return { withCapability: false, id: signer.id, signer }
  },
  'key-ed25519': () => {
    return { withCapability: false, id: keyDID.id, signer: keyDID }
  },
  'pkh-ethereum': async () => {
    const authMethod = await getEthereumAuth()
    const [signer, expiredSigner] = await Promise.all([
      createCapabilityDID(authMethod, { resources: ['ceramic://*'] }),
      createExpiredCapabilityDID(authMethod, { resources: ['ceramic://*'] }),
    ])
    return { withCapability: true, id: signer.id, signer, expiredSigner }
  },
  'pkh-solana': async () => {
    const authMethod = await getSolanaAuth()
    const [signer, expiredSigner] = await Promise.all([
      createCapabilityDID(authMethod, { resources: ['ceramic://*'] }),
      createExpiredCapabilityDID(authMethod, { resources: ['ceramic://*'] }),
    ])
    return { withCapability: true, id: signer.id, signer, expiredSigner }
  },
} satisfies Record<ControllerType, () => Controller | Promise<Controller>>

for (const [controllerType, createController] of Object.entries(
  controllerFactories,
)) {
  // Create controller
  const controller = await createController()

  // Deterministic (init) event
  const validDeterministicEvent = getDeterministicInitEvent(
    model,
    controller.id,
  )

  // Signed init event
  const validInitPayload = InitEventPayload.encode({
    data: { test: true },
    header: createInitHeader({
      controller: controller.id,
      model,
      unique: new Uint8Array([0, 1, 2, 3]),
    }),
  })
  const validInitEvent = await signEvent(controller.signer, validInitPayload)
  const validInitCAR = signedEventToCAR(validInitEvent)

  const invalidInitSignatureCAR = signedEventToCAR(
    changeEventSignature(validInitEvent),
  )

  // Data event
  const streamID = getStreamID(validInitCAR.roots[0])
  const validDataPayload = createDataEventPayload(
    CommitID.fromStream(streamID),
    [{ op: 'add', path: '/update', value: true }],
  )
  const validDataEvent = await signEvent(controller.signer, validDataPayload)
  const validDataCAR = signedEventToCAR(validDataEvent)

  const invalidDataSignatureCAR = signedEventToCAR(
    changeEventSignature(validDataEvent),
  )

  const carBlocks: Array<IBlock> = [
    ...validInitCAR.blocks,
    ...validDataCAR.blocks,
    ...invalidInitSignatureCAR.blocks,
    ...invalidDataSignatureCAR.blocks,
  ]
  const carMeta: Record<string, unknown> = {
    controller: controller.id,
    model: model.bytes,
    validInitEvent: validInitCAR.roots[0],
    validDataEvent: validDataCAR.roots[0],
    invalidInitEventSignature: invalidInitSignatureCAR.roots[0],
    invalidDataEventSignature: invalidDataSignatureCAR.roots[0],
  }

  if (controller.withCapability) {
    // Events with expired capabilities

    const expiredInitEvent = await signEvent(
      controller.expiredSigner,
      validInitPayload,
    )
    const expiredInitCAR = signedEventToCAR(expiredInitEvent)
    carBlocks.push(...expiredInitCAR.blocks)
    carMeta.expiredInitEventCapability = expiredInitCAR.roots[0]

    const expiredDataEvent = await signEvent(
      controller.expiredSigner,
      validDataPayload,
    )
    const expiredDataCAR = signedEventToCAR(expiredDataEvent)
    carBlocks.push(...expiredDataCAR.blocks)
    carMeta.expiredDataEventCapability = expiredDataCAR.roots[0]

    // Events with altered capability signatures

    const invalidCapability = changeCapabilitySignature(
      controller.signer.capability,
    )

    const invalidInitCapability = await signEvent(
      controller.signer,
      validInitPayload,
      { capability: invalidCapability } as unknown as CreateJWSOptions,
    )
    const invalidInitCapabilityCAR = signedEventToCAR(invalidInitCapability)
    carBlocks.push(...invalidInitCapabilityCAR.blocks)
    carMeta.invalidInitEventCapabilitySignature =
      invalidInitCapabilityCAR.roots[0]

    const invalidDataCapability = await signEvent(
      controller.signer,
      validDataPayload,
      { capability: invalidCapability } as unknown as CreateJWSOptions,
    )
    const invalidDataCapabilityCAR = signedEventToCAR(invalidDataCapability)
    carBlocks.push(...invalidDataCapabilityCAR.blocks)
    carMeta.invalidDataEventCapabilitySignature =
      invalidDataCapabilityCAR.roots[0]
  }

  // Write CAR file
  const controllerCAR = createCAR(
    carBlocks,
    { validDeterministicEvent, validInitPayload, validDataPayload },
    carMeta,
  )
  await writeCARFile(controllerType as ControllerType, controllerCAR)
}
