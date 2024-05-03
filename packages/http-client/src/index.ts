import createAPIClient, { type ClientOptions } from 'openapi-fetch'

import type { paths } from './__generated__/api'

export function createClient(options?: ClientOptions) {
  return createAPIClient<paths>(options)
}
