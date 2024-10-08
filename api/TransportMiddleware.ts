import { ClientExtensions } from "./Transport"
import { APIMiddleware } from "./TransportTypes"

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