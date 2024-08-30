import {
  InitEventPayload,
  signEvent,
  signedEventToCAR,
} from '@ceramic-sdk/events'
import { CommitID } from '@ceramic-sdk/identifiers'
import {
  createDataEventPayload,
  createInitHeader,
  getDeterministicInitEvent,
} from '@ceramic-sdk/model-instance-client'
import { getStreamID } from '@ceramic-sdk/model-instance-protocol'
import { webauthn } from '@ceramic-sdk/test-utils'
import type { IBlock } from 'cartonne'
import type { CreateJWSOptions, DID } from 'dids'

import type { ControllerType } from '../src/index.ts'

import { createCAR } from './utils/car.ts'
import { controllerFactories } from './utils/controllers.ts'
import { writeCARFile } from './utils/fs.ts'
import {
  changeCapabilitySignature,
  changeEventSignature,
} from './utils/signatures.ts'
import { testModel } from './utils/streams.ts'

// Inject mock WebAuthn authenticator
webauthn.injectMockBrowserGlobals()

for (const [controllerType, createController] of Object.entries(
  controllerFactories,
)) {
  // Create controller
  const controller = await createController()

  // Deterministic (init) event
  const validDeterministicEvent = getDeterministicInitEvent(
    testModel,
    controller.id,
  )

  // Signed init event
  const validInitPayload = InitEventPayload.encode({
    data: { test: true },
    header: createInitHeader({
      controller: controller.id,
      model: testModel,
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
    model: testModel.bytes,
    validInitEvent: validInitCAR.roots[0],
    validDataEvent: validDataCAR.roots[0],
    invalidInitEventSignature: invalidInitSignatureCAR.roots[0],
    invalidDataEventSignature: invalidDataSignatureCAR.roots[0],
  }

  if (controller.withCapability) {
    async function addEvents(
      signer: DID,
      initKey: string,
      dataKey: string,
      options?: CreateJWSOptions,
    ) {
      const initEvent = await signEvent(signer, validInitPayload, options)
      const initCAR = signedEventToCAR(initEvent)
      carBlocks.push(...initCAR.blocks)
      carMeta[initKey] = initCAR.roots[0]

      const dataEvent = await signEvent(signer, validDataPayload, options)
      const dataCAR = signedEventToCAR(dataEvent)
      carBlocks.push(...dataCAR.blocks)
      carMeta[dataKey] = dataCAR.roots[0]
    }

    // Events with expired capabilities
    await addEvents(
      controller.expiredSigner,
      'expiredInitEventCapability',
      'expiredDataEventCapability',
    )

    // Events with altered capability signatures
    await addEvents(
      controller.signer,
      'invalidInitEventCapabilitySignature',
      'invalidDataEventCapabilitySignature',
      {
        capability: changeCapabilitySignature(controller.signer.capability),
      } as unknown as CreateJWSOptions,
    )

    // Events with no allowed resource
    await addEvents(
      controller.noResourceSigner,
      'invalidInitEventCapabilityNoResource',
      'invalidDataEventCapabilityNoResource',
    )

    // Events with other model resource
    await addEvents(
      controller.otherModelSigner,
      'invalidInitEventCapabilityOtherModel',
      'invalidDataEventCapabilityOtherModel',
    )

    // Events with exact model resource (no wildcard)
    await addEvents(
      controller.expectedModelSigner,
      'validInitEventCapabilityExactModel',
      'validDataEventCapabilityExactModel',
    )
  }

  // Write CAR file
  const controllerCAR = createCAR(
    carBlocks,
    { validDeterministicEvent, validInitPayload, validDataPayload },
    carMeta,
  )
  await writeCARFile(controllerType as ControllerType, controllerCAR)
}
