import { StreamID } from '@ceramic-sdk/identifiers'
import type { CID } from 'multiformats/cid'

import { STREAM_TYPE_ID } from './constants.js'

export function getModelStreamID(cid: CID): StreamID {
  return new StreamID(STREAM_TYPE_ID, cid)
}
