
import { urlString } from "../lib/URL"
import { logger } from "../logging"
import { TiFAPITransportMiddleware } from "./TransportMiddleware"
import { APIRequestBody, EndpointSchemaToMiddleware, HTTPMethod, StatusCodeMap } from "./TransportTypes"

const NoContentStatusCode = 204

const log = logger("tif.api.client")

/**
 * TiFAPIMiddleware that fetches data from a given url for clients of TiFAPI.
 *
 * @param baseURL the base url of the backend to use.
 * @param middleware a function to modify the fetch call.
 * @returns TiFAPIMiddleware to construct an instance of a TiFAPIClient.
 */
export const tifAPITransport = (baseURL: URL, middleware: TiFAPITransportMiddleware): EndpointSchemaToMiddleware =>
  (endpointName, { httpRequest: { endpoint, method } }) => 
    async ({ body, query, params, signal } = {}) => {
      try {
        const resp = await performRequest(
          method, 
          middleware, 
          urlString({baseURL, endpoint, params, query}), 
          body,
          signal
        )
        
        const data = await tryResponseBody(resp)
        
        if (data && resp.status === NoContentStatusCode) {
          throw new Error(
            `TiFAPI responded with a 204 status code and body ${JSON.stringify(data)}. A 204 status code should not produce a body.`
          )
        }

        return {
          // NB: typescript doesn't properly expect the union of status codes
          status: resp.status as StatusCodeMap[keyof StatusCodeMap] as any,
          data,
        }
      } catch (error) {
        if (!(error instanceof DOMException) || error.name !== "AbortError") {
          log.error("Failed to make tif API request.", {
            error,
            errorMessage: error.message,
            input: {body, query, params},
            endpointName
          })
        }
        throw error
      }
    }

const performRequest = async (
  method: HTTPMethod,
  middleware: TiFAPITransportMiddleware,
  url: string,
  body?: APIRequestBody,
  signal?: AbortSignal
) => {
  return await middleware(
    {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal
    },
    (request) => fetch(url, request)
  )
}

const tryResponseBody = async (resp: Response) => {
  try {
    const body = await resp.json()
    return body
  } catch {
    if (resp.status !== NoContentStatusCode) {
      throw new Error(
        `TiF API responded with non-JSON body and status ${resp.status}.`
      )
    }
    return undefined
  }
}
