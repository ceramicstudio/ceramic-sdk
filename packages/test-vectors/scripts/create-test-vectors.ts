import {
  InitEventPayload,
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
import { EthereumDID, type Hex } from '@ceramic-sdk/test-utils'
import { getAuthenticatedDID } from '@didtools/key-did'
import type { DID } from 'dids'

import { createCAR } from './utils/car.ts'
import { writeCARFile } from './utils/fs.ts'

const model = StreamID.fromString(
  'k2t6wz4z9kggqqnbn3vqggh2z4fe9jctr9vvbc1em2yho0qnzzrtzz1n2hr4lq',
)

type Controller = {
  id: string
  signer: DID
}

const controllerFactories = {
  'key-plain': async () => {
    const did = await getAuthenticatedDID(new Uint8Array(32))
    return { id: did.id, signer: did }
  },
  'pkh-ethereum': async () => {
    const ethereumDID = await EthereumDID.fromPrivateKey(
      '0xe50df915de22bad5bf1abf43f78b55d64640afdcdfa6b1699a514d97662b23f7' as Hex,
      { domain: 'localhost', resources: ['ceramic://*'] },
    )
    const session = await ethereumDID.createSession()
    return { id: ethereumDID.id, signer: session.did }
  },
} satisfies Record<string, () => Promise<Controller>>

for (const [controllerType, createController] of Object.entries(
  controllerFactories,
)) {
  // Setup
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

  // Data event
  const streamID = getStreamID(validInitCAR.roots[0])
  const validDataPayload = createDataEventPayload(
    CommitID.fromStream(streamID),
    [{ op: 'add', path: '/update', value: true }],
  )
  const validDataEvent = await signEvent(controller.signer, validDataPayload)
  const validDataCAR = signedEventToCAR(validDataEvent)

  // Write CAR file
  const controllerCAR = createCAR(
    [...validInitCAR.blocks, ...validDataCAR.blocks],
    { validDeterministicEvent, validInitPayload, validDataPayload },
    {
      controller: controller.id,
      model: model.bytes,
      validInitEvent: validInitCAR.roots[0],
      validDataEvent: validDataCAR.roots[0],
    },
  )
  await writeCARFile(controllerType, controllerCAR)
}
