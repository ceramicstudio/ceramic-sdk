import { StreamID } from '@ceramic-sdk/identifiers'
import type { CID } from 'multiformats/cid'

import {
  DeterministicInitEventHeader,
  type DocumentInitEventHeader,
} from './codecs.js'
import { STREAM_TYPE_ID } from './constants.js'

export function getDeterministicStreamID(
  header: DocumentInitEventHeader,
): StreamID {
  // Generate deterministic stream ID from specific header keys
  const initHeader = DeterministicInitEventHeader.encode({
    controllers: header.controllers,
    model: header.model,
    sep: header.sep,
    unique: header.unique,
  })
  return StreamID.fromInitEventPayload(STREAM_TYPE_ID, {
    data: null,
    header: initHeader,
  })
}

export function getStreamID(cid: CID): StreamID {
  return new StreamID(STREAM_TYPE_ID, cid)
}
