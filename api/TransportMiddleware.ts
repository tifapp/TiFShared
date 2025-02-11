import { LogLevel, logger } from "../logging"
import { ClientExtensions } from "./Transport"
import { APIMiddleware } from "./TransportTypes"
import { URLEndpoint, urlString } from "../lib/URL"
import { uuidString } from "../lib/UUID"

/**
 * Transport middleware that adds a JWT bearer token to the outgoing request.
 */
export const jwtMiddleware = (
  jwt: () => Promise<string | undefined>
): APIMiddleware<ClientExtensions> => {
  return async (request, next) => {
    const token = await jwt()
    if (!token) return await next(request)
    return await next({
      ...request,
      headers: { ...request.headers, Authorization: `Bearer ${token}` }
    })
  }
}

/**
 * A middleware for request logging.
 *
 * @param apiName The name of the API to log requests for.
 * @param level The log level to log requests at. Defaults to `"trace"`.
 */
export const requestLoggingMiddleware = (
  apiName: string,
  level: LogLevel = "trace"
): APIMiddleware<ClientExtensions> => {
  const log = logger(`${apiName}.api.requests`)
  return async (request, next) => {
    const requestId = uuidString()
    const method = request.endpointSchema.httpRequest.method
    const path = urlString({
      endpoint: request.endpointSchema.httpRequest.endpoint,
      params: request.params,
      query: request.query
    })
    log[level](`Sending ${method} request to path ${path}.`, {
      body: request.body,
      requestId
    })
    const resp = await next(request)
    log[level](`Received ${resp.status} response from path ${path}.`, {
      body: resp.data,
      requestId
    })
    return resp
  }
}
