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
import { createControllerDir, writeCARFile } from './utils/fs.ts'

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
  const dirPath = await createControllerDir(controllerType, {
    controller: controller.id,
    model: model.toString(),
  })

  // Deterministic (init) event

  const deterministicEvent = getDeterministicInitEvent(model, controller.id)
  await writeCARFile(
    [dirPath, 'valid', 'deterministic'],
    createCAR(deterministicEvent),
  )

  // Signed init event

  const initPayload = InitEventPayload.encode({
    data: { test: true },
    header: createInitHeader({
      controller: controller.id,
      model,
      unique: new Uint8Array([0, 1, 2, 3]),
    }),
  })
  await writeCARFile([dirPath, 'valid', 'init-payload'], createCAR(initPayload))

  const initEvent = await signEvent(controller.signer, initPayload)
  const initCAR = signedEventToCAR(initEvent)
  const initCID = initCAR.roots[0]
  await writeCARFile([dirPath, 'valid', 'init-event'], initCAR)

  // Data event

  const streamID = getStreamID(initCID)
  const dataPayload = createDataEventPayload(CommitID.fromStream(streamID), [
    { op: 'add', path: '/update', value: true },
  ])
  await writeCARFile([dirPath, 'valid', 'data-payload'], createCAR(dataPayload))

  const dataEvent = await signEvent(controller.signer, dataPayload)
  await writeCARFile(
    [dirPath, 'valid', 'data-event'],
    signedEventToCAR(dataEvent),
  )
}
