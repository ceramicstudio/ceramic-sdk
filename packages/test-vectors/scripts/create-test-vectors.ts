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
import { getAuthenticatedDID } from '@didtools/key-did'

import { createCAR } from './utils/car.ts'
import { createControllerDir, writeCARFile } from './utils/fs.ts'

const model = StreamID.fromString(
  'k2t6wz4z9kggqqnbn3vqggh2z4fe9jctr9vvbc1em2yho0qnzzrtzz1n2hr4lq',
)

const controller = await getAuthenticatedDID(new Uint8Array(32))

const path = await createControllerDir('key-plain', {
  controller: controller.id,
  model: model.toString(),
})

const deterministicEvent = getDeterministicInitEvent(model, controller.id)

await writeCARFile(
  [path, 'valid', 'deterministic'],
  createCAR(deterministicEvent),
)

const initPayload = InitEventPayload.encode({
  data: { test: true },
  header: createInitHeader({
    controller: controller.id,
    model,
    unique: new Uint8Array([0, 1, 2, 3]),
  }),
})
await writeCARFile([path, 'valid', 'init-payload'], createCAR(initPayload))

const initEvent = await signEvent(controller, initPayload)
const initCAR = signedEventToCAR(initEvent)
const initCID = initCAR.roots[0]
await writeCARFile([path, 'valid', 'init-event'], initCAR)

const streamID = getStreamID(initCID)

const dataPayload = createDataEventPayload(CommitID.fromStream(streamID), [
  { op: 'add', path: '/update', value: true },
])
await writeCARFile([path, 'valid', 'data-payload'], createCAR(dataPayload))

const dataEvent = await signEvent(controller, dataPayload)
await writeCARFile([path, 'valid', 'data-event'], signedEventToCAR(dataEvent))
