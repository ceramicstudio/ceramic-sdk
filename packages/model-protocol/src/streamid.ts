import { StreamID } from '@ceramicnetwork/streamid'

import { STREAM_TYPE_ID } from './constants.js'
import type { ModelInitEventPayload } from './types.js'

export async function getModelStreamID(
  event: ModelInitEventPayload,
): Promise<StreamID> {
  return await StreamID.fromGenesis(STREAM_TYPE_ID, event)
}
