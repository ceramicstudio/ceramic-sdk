import type { EventHeader } from '@ceramic-sdk/types'

import type { ModelDefinition } from './codecs.js'

export type ModelInitEventPayload = {
  data: ModelDefinition
  header: EventHeader
}
