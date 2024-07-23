import { Middleware } from "lib/Middleware"

export type TiFAPITransportMiddleware = Middleware<RequestInit, Response>

/**
 * Transport middleware that adds a JWT bearer token to the outgoing request.
 */
export const jwtMiddleware = (
  jwt: () => Promise<string | undefined>
): TiFAPITransportMiddleware => {
  return async (request, next) => {
    const token = await jwt()
    if (!token) return await next(request)
    return await next({
      ...request,
      headers: { ...request.headers, Authorization: `Bearer ${token}` }
    })
  }
}