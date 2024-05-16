import { StreamID } from '@ceramic-sdk/identifiers'

import { ModelInitEventPayload } from './codecs.js'
import { STREAM_TYPE_ID } from './constants.js'

export async function getModelStreamID(
  event: ModelInitEventPayload,
): Promise<StreamID> {
  return await StreamID.fromGenesis(
    STREAM_TYPE_ID,
    ModelInitEventPayload.encode(event),
  )
}
