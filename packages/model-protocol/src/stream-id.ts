import { StreamID } from '@ceramic-sdk/identifiers'

import { ModelInitEventPayload } from './codecs.js'
import { STREAM_TYPE_ID } from './constants.js'

export function getModelStreamID(event: ModelInitEventPayload): StreamID {
  return StreamID.fromInitEventPayload(
    STREAM_TYPE_ID,
    ModelInitEventPayload.encode(event),
  )
}
