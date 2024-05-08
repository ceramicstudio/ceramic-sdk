import { StreamID } from '@ceramicnetwork/streamid'
import { code, encode } from '@ipld/dag-cbor'
import { CID } from 'multiformats/cid'
import { create } from 'multiformats/hashes/digest'
import { identity } from 'multiformats/hashes/identity'

export const STREAM_TYPE_NAME = 'model'
export const STREAM_TYPE_ID = 2

// The hardcoded "model" StreamID that all Model streams have in their metadata. This provides
// a "model" StreamID that can be indexed to query the set of all published Models.
// The StreamID uses the "UNLOADABLE" StreamType, and has string representation: "kh4q0ozorrgaq2mezktnrmdwleo1d"
const multihash = identity.digest(encode('model-v1'))
const digest = create(code, multihash.bytes)
const cid = CID.createV1(code, digest)
export const MODEL = new StreamID('UNLOADABLE', cid)

export const MODEL_STREAM_ID = MODEL.toString()

export const VERSION = '2.0'
