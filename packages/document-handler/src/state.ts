import type { DocumentDataEventPayload } from '@ceramic-sdk/document-protocol'
import { TimeEvent } from '@ceramic-sdk/events'

import type { DocumentEventPayload } from './codecs.js'
import type { DocumentState } from './types.js'

type PayloadLog = Array<DocumentEventPayload>

export function isEventHandled(eventID: string, state: DocumentState): boolean {
  return state.log.includes(eventID)
}

export function hasExpectedPrev(
  payload: DocumentDataEventPayload | TimeEvent,
  state: DocumentState,
): boolean {
  if (state.log.length === 0) {
    throw new Error('Invalid document state: log is empty')
  }
  return payload.prev.toString() === state.log[state.log.length - 1]
}

/**
 * Given two different Stream logs representing two different conflicting histories of the same
 * Stream, pick which history to accept, in accordance with our conflict resolution strategy.
 * The inputted logs should contain only the new commits past the divergence point between the
 * two histories - there should be no commits in common between the two input logs.
 * @param log1
 * @param log2
 * @returns the log that is selected by the conflict resolution rules.
 */
export function pickLogToAccept(
  log1: PayloadLog,
  log2: PayloadLog,
): PayloadLog {
  const firstTimeIndexForLog1 = log1.findIndex(TimeEvent.is)
  const firstTimeIndexForLog2 = log2.findIndex(TimeEvent.is)
  const isLog1Anchored = firstTimeIndexForLog1 >= 0
  const isLog2Anchored = firstTimeIndexForLog2 >= 0

  // When one of the logs is anchored but not the other, take the one that is anchored
  if (isLog1Anchored !== isLog2Anchored) {
    return isLog1Anchored ? log1 : log2
  }

  throw new Error('Not implemented')

  // if (isLog1Anchored && isLog2Anchored) {
  //   // When both logs are anchored, take the one anchored first.
  //   const anchorTimestamp1 = log1[firstTimeIndexForLog1].timestamp
  //   const anchorTimestamp2 = log2[firstTimeIndexForLog2].timestamp
  //   if (anchorTimestamp1 < anchorTimestamp2) {
  //     return log1
  //   } else if (anchorTimestamp2 < anchorTimestamp1) {
  //     return log2
  //   }
  // }

  // When both logs are anchored in the same block (or neither log is anchored), compare log
  // lengths until that anchor (or the end of the log if not anchored) and choose the one with
  // longer length.
  // TODO(CDB-2746) - it's kind of dumb that we only consider the log up until the first anchor.
  // This is basically a holdover from the way conflict resolution was originally implemented, but
  // changing it now would be a breaking change.
  // const relevantLength1 = isLog1Anchored
  //   ? firstAnchorIndexForLog1 + 1
  //   : log1.length
  // const relevantLength2 = isLog2Anchored
  //   ? firstAnchorIndexForLog2 + 1
  //   : log2.length

  // if (relevantLength1 > relevantLength2) {
  //   return log1
  // } else if (relevantLength1 < relevantLength2) {
  //   return log2
  // }

  // If we got this far, that means that we don't have sufficient information to make a good
  // decision about which log to choose.  The most common way this can happen is that neither log
  // is anchored, although it can also happen if both are anchored but in the same blockNumber or
  // blockTimestamp. At this point, the decision of which log to take is arbitrary, but we want it
  // to still be deterministic. Therefore, we take the log whose last entry has the lowest CID.
  // return log1[log1.length - 1].cid.bytes < log2[log2.length - 1].cid.bytes
  //   ? log1
  //   : log2
}
