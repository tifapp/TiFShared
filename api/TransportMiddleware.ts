import { LogLevel, logger } from "../logging"
import { ClientExtensions } from "./Transport"
import { APIMiddleware } from "./TransportTypes"
import { URLEndpoint, urlString } from "../lib/URL"

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
    const method = request.endpointSchema.httpRequest.method
    const path = urlString({
      endpoint: request.endpointName as URLEndpoint,
      params: request.params,
      query: request.query
    })
    const metadata = request.body ? { body: request.body } : undefined
    log[level](`Sending ${method} request to path ${path}.`, metadata)
    return await next(request)
  }
}
