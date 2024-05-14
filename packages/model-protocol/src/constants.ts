import { StreamID } from '@ceramicnetwork/streamid'

// The hardcoded "model" StreamID that all Model streams have in their metadata. This provides
// a "model" StreamID that can be indexed to query the set of all published Models.
// The StreamID uses the "UNLOADABLE" StreamType, and has string representation: "kh4q0ozorrgaq2mezktnrmdwleo1d"
export const MODEL_STREAM_ID = 'kh4q0ozorrgaq2mezktnrmdwleo1d'
export const MODEL = StreamID.fromString(MODEL_STREAM_ID)

export const MODEL_RESOURCE_URI = `ceramic://*?model=${MODEL_STREAM_ID}`

export const STREAM_TYPE_NAME = 'model'
export const STREAM_TYPE_ID = 2

export const VERSION = '2.0'
