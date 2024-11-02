import { urlString } from "../lib/URL"
import { Logger, logger } from "../logging"
import { APIHandler, StatusCodes } from "./TransportTypes"

export function resp<StatusCode extends StatusCodes, const T extends object>(
  status: StatusCode,
  data: T
): { status: StatusCode; data: T }
export function resp<StatusCode extends StatusCodes>(
  status: StatusCode
): { status: StatusCode; data?: undefined }
export function resp<StatusCode extends StatusCodes, const T extends object>(
  status: StatusCode,
  data?: T
) {
  return {
    status,
    data
  }
}

const NoContentStatusCode = 204

const log = logger("tif.api.client")

export type ClientExtensions = { signal?: AbortSignal; headers?: HeadersInit }

/**
 * TiFAPIMiddleware that fetches data from a given url for clients of TiFAPI.
 *
 * @param baseURL the base url of the backend to use.
 * @returns TiFAPIMiddleware to construct an instance of a TiFAPIClient.
 */
export const tifAPITransport = (baseURL: URL) => {
  return apiTransport("TiF", baseURL, log)
}

/**
 * API Middleware that fetches data from a given url for clients of an HTTP API.
 *
 * @param baseURL the base url of the api to use.
 * @param log A custom {@link Logger} to use.
 * @returns API Middleware to construct an instance of an API client.
 */
export const apiTransport = (
  apiName: string,
  baseURL: URL,
  log: Logger
): APIHandler<ClientExtensions> => {
  return async ({
    headers,
    endpointName,
    endpointSchema: {
      httpRequest: { endpoint, method }
    },
    body,
    query,
    params,
    signal
  }) => {
    try {
      const resp = await fetch(
        urlString({ baseURL, endpoint, params, query }),
        {
          method,
          headers: { "Content-Type": "application/json", ...headers },
          body: body ? JSON.stringify(body) : undefined,
          signal
        }
      )

      const data = await tryResponseBody(apiName, resp)

      if (data && resp.status === NoContentStatusCode) {
        throw new Error(
          `${apiName} API responded with a 204 status code and body ${JSON.stringify(data)}. A 204 status code should not produce a body.`
        )
      }

      return {
        // NB: typescript doesn't properly expect the union of status codes
        status: resp.status as StatusCodes as any,
        data
      }
    } catch (error) {
      if (!(error instanceof DOMException) || error.name !== "AbortError") {
        log.error(`Failed to make ${apiName} API request.`, {
          error,
          errorMessage: error.message,
          body,
          query,
          params,
          endpointName
        })
      }
      throw error
    }
  }
}

const tryResponseBody = async (apiName: string, resp: Response) => {
  try {
    const body = await resp.json()
    return body
  } catch {
    if (resp.status !== NoContentStatusCode) {
      throw new Error(
        `${apiName} API responded with non-JSON body and status ${resp.status}.`
      )
    }
    return undefined
  }
}
