import createAPIClient, { type HeadersOptions } from 'openapi-fetch'

import type { components, paths } from './__generated__/api'

export type CeramicAPI = ReturnType<typeof createAPIClient<paths>>

export type ClientParams = {
  url: string
  fetch?: (request: Request) => ReturnType<typeof fetch>
  headers?: HeadersOptions
}

export class CeramicClient {
  #api: CeramicAPI

  constructor(params: ClientParams) {
    const { url, ...options } = params
    this.#api = createAPIClient<paths>({ baseUrl: `${url}/api/v0`, ...options })
  }

  get api(): CeramicAPI {
    return this.#api
  }

  async getEvent(id: string): Promise<components['schemas']['Event']> {
    const { data, error } = await this.#api.GET('/events/{event_id}', {
      params: { path: { event_id: id } },
    })
    if (error == null) {
      return data
    }
    throw new Error(typeof error === 'string' ? error : error.message)
  }
}
