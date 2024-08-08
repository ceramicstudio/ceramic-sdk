import {
  type SignedEvent,
  carFromString,
  carToString,
  eventFromString,
  eventToCAR,
} from '@ceramic-sdk/events'
import type { CAR } from 'cartonne'
import type { Codec, Decoder } from 'codeco'
import type { CID } from 'multiformats/cid'
import createAPIClient, { type HeadersOptions } from 'openapi-fetch'
import type { SimplifyDeep } from 'type-fest'

import type { components, paths } from './__generated__/api'

export type CeramicAPI = ReturnType<typeof createAPIClient<paths>>

export type Schemas = SimplifyDeep<components['schemas']>
export type Schema<Name extends keyof Schemas> = SimplifyDeep<Schemas[Name]>

export type ClientParams = {
  url: string
  fetch?: (request: Request) => ReturnType<typeof fetch>
  headers?: HeadersOptions
}

export type EventsFeedParams = {
  resumeAt?: string
  limit?: number
  includeData?: 'none' | 'full'
}

export class CeramicClient {
  #api: CeramicAPI

  constructor(params: ClientParams) {
    const { url, ...options } = params
    this.#api = createAPIClient<paths>({
      baseUrl: `${url}/ceramic`,
      querySerializer: {
        object: { style: 'form', explode: true },
      },
      ...options,
    })
  }

  get api(): CeramicAPI {
    return this.#api
  }

  async getEvent(id: string): Promise<Schema<'Event'>> {
    const { data, error } = await this.#api.GET('/events/{event_id}', {
      params: { path: { event_id: id } },
    })
    if (error != null) {
      throw new Error(error.message)
    }
    return data
  }

  async getEventCAR(id: string): Promise<CAR> {
    const event = await this.getEvent(id)
    if (event.data == null) {
      throw new Error('Missing event data')
    }
    return carFromString(event.data)
  }

  async getEventType<Payload>(
    decoder: Decoder<unknown, Payload>,
    id: string,
  ): Promise<SignedEvent | Payload> {
    const event = await this.getEvent(id)
    if (event.data == null) {
      throw new Error('Missing event data')
    }
    return eventFromString(decoder, event.data)
  }

  async getEventsFeed(
    params: EventsFeedParams = {},
  ): Promise<Schema<'EventFeed'>> {
    const { data, error } = await this.#api.GET('/feed/events', {
      params: { query: params },
    })
    if (error != null) {
      throw new Error(error.message)
    }
    return data
  }

  async getVersion(): Promise<Schema<'Version'>> {
    const { data, error } = await this.#api.GET('/version')
    if (error != null) {
      throw new Error(error.message)
    }
    return data
  }

  async postEvent(data: string): Promise<void> {
    const { error } = await this.#api.POST('/events', { body: { data } })
    if (error != null) {
      throw new Error(error.message)
    }
  }

  async postEventCAR(car: CAR): Promise<CID> {
    await this.postEvent(carToString(car))
    return car.roots[0]
  }

  async postEventType(codec: Codec<unknown>, event: unknown): Promise<CID> {
    const car = eventToCAR(codec, event)
    return await this.postEventCAR(car)
  }

  async registerInterestModel(model: string): Promise<void> {
    const { error } = await this.#api.POST('/interests', {
      body: { sep: 'model', sepValue: model },
    })
    if (error != null) {
      throw new Error(error.message)
    }
  }
}
