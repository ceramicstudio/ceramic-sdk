import type { EventPayload } from '@ceramic-sdk/types'

import type { ModelDefinition } from './codecs.js'

export type ModelInitEventPayload = EventPayload<ModelDefinition>
