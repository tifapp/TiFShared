/**
 * A function that can modifiy a low-level request to the TiFAPI and returns
 * a modified response.
 */
export type TiFAPIMiddleware = (
  request: RequestInit,
  next: (request: RequestInit) => Promise<Response>
) => Promise<Response>

/**
 * Adds a JWT bearer token to the outgoing request.
 */
export const jwtMiddleware = (
  jwt: () => Promise<string | undefined>
): TiFAPIMiddleware => {
  return async (
    request: RequestInit,
    next: (request: RequestInit) => Promise<Response>
  ) => {
    const token = await jwt()
    if (!token) return await next(request)
    return await next({
      ...request,
      headers: { ...request.headers, Authorization: `Bearer ${token}` }
    })
  }
}
