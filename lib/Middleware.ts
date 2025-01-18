import { NonEmptyArray } from "./Types/HelperTypes"

/**
 * This type of function is responsible for handling the outcome of a request
 * after it has been processed by all middleware in the chain.
 */
export type Handler<TInput, TOutput> = (request: TInput) => Promise<TOutput>

/**
 * This represents a middleware function used to process requests and then pass control to the next function in the chain.
 */
export type Middleware<TInput, TOutput> = (
  request: TInput,
  next: Handler<TInput, TOutput>
) => Promise<TOutput>

/**
 * Combines multiple {@link Middleware} functions of the same signature into a single Middleware function.
 *
 * Usage example:
 * ```ts
 *  const enhancedMiddleware = chainMiddleware(
 *   firstMiddleware,
 *   secondMiddleware,
 *   thirdMiddleware
 *  )
 * ```
 *
 * @param middlewares Middleware functions to be chained together. They must have the same signature.
 * @returns A single Middleware function that chains the given middlewares.
 */
export const chainMiddleware = <TInput, TOutput>(
  ...middlewares: NonEmptyArray<Middleware<TInput, TOutput>>
): Middleware<TInput, TOutput> => middlewares.reduce(chain2Middleware)

/**
 * Creates a function handler from a series of middleware functions.
 * Throws an error if the request is not fully handled by the middleware chain.
 *
 * Usage example:
 * ```ts
 *  const credentialsHandler = middlewareRunner(
 *   logMiddleware,
 *   authMiddleware,
 *   signInHandler
 *  )
 * ```
 *
 * @param middlewares Middleware functions to be chained together. They must have the same signature and must fully handle the request.
 * @returns A single Handler function that passes an input through the entire middleware chain.
 */
export const middlewareRunner = <TInput, TOutput>(
  ...middlewares: NonEmptyArray<Middleware<TInput, TOutput>>
): Handler<TInput, TOutput> => {
  middlewares.push(async () => {
    throw new Error("Middleware chain does not handle the request fully.")
  })
  return middlewares.reduce(chain2Middleware) as Handler<TInput, TOutput>
}

const chain2Middleware = <TInput, TOutput>(
  middleware1: Middleware<TInput, TOutput>,
  middleware2: Middleware<TInput, TOutput>
): Middleware<TInput, TOutput> => {
  return async (request, next) => {
    return await middleware1(
      request,
      async (request) => await middleware2(request, next)
    )
  }
}
