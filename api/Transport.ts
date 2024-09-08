import { urlString } from "../lib/URL"
import { logger } from "../logging"
import { TiFAPITransportMiddleware } from "./TransportMiddleware"
import { APIMiddleware, APIRequestBody, HTTPMethod, StatusCodes } from "./TransportTypes"

export function resp<StatusCode extends StatusCodes, const T>(status: StatusCode, data: T): { status: StatusCode, data: T };
export function resp<StatusCode extends StatusCodes>(status: StatusCode): { status: StatusCode, data?: undefined };
export function resp<StatusCode extends StatusCodes, const T>(status: StatusCode, data?: T) {
  return ({
    status,
    data
  })
}

const NoContentStatusCode = 204

const log = logger("tif.api.client")

/**
 * TiFAPIMiddleware that fetches data from a given url for clients of TiFAPI.
 *
 * @param baseURL the base url of the backend to use.
 * @param middleware a function to modify the fetch call.
 * @returns TiFAPIMiddleware to construct an instance of a TiFAPIClient.
 */
export const tifAPITransport = (baseURL: URL, middleware: TiFAPITransportMiddleware): APIMiddleware<{signal: AbortSignal}> =>
  async ({endpointSchema: {endpointName, httpRequest: { endpoint, method } }, input}) => 
    {
      try {
        const { body, query, params, signal } = input ?? {}

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
          status: resp.status as StatusCodes as any,
          data,
        }
      } catch (error) {
        if (!(error instanceof DOMException) || error.name !== "AbortError") {
          log.error("Failed to make tif API request.", {
            error,
            errorMessage: error.message,
            input,
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
