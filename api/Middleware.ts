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
 * Chains 2 {@link TiFAPIMiddleware} instances together in the order they were
 * passed into this function.
 *
 * ```ts
 *  // Every request will run the jwtMiddleware, followed by
 *  // someOtherMiddleware, followed by middleware3.
 *  const middleware = chainMiddleware(
 *   jwtMiddleware(loadJWT),
 *   someOtherMiddleware,
 *   middleware3
 * )
 * const api = new TiFAPI(tifAPITransport(API_URL, middleware))
 * ```
 */
export const chainMiddleware = (
  middleware1: TiFAPIMiddleware,
  ...middlewares: TiFAPIMiddleware[]
): TiFAPIMiddleware => {
  return middlewares.reduce((acc, middleware) => {
    return chain2Middleware(acc, middleware)
  }, middleware1)
}

const chain2Middleware = (
  m1: TiFAPIMiddleware,
  m2: TiFAPIMiddleware
): TiFAPIMiddleware => {
  return async (request, next) => {
    return await m1(request, async (request) => await m2(request, next))
  }
}
