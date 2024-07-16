<<<<<<< HEAD
import { Middleware, chainMiddleware, runMiddleware } from "./Middleware"
=======
import { Middleware, chainMiddleware, handleMiddleware } from "./Middleware"
>>>>>>> e7d1d5a (no message)
import { NonEmptyArray } from "./Types/HelperTypes"

describe("MiddlewareTests", () => {
  const testMiddleware = (iter: number): Middleware<string, string> => 
    async (request, next) => {
      return await next(
        request + `test${iter} `
      )
    }

  test("chain 2 middlewares", async () => {
    const middleware = chainMiddleware(testMiddleware(1), testMiddleware(2), async (_) => _)
    const response = await middleware("input ", async (_) => _)
    expect(response).toEqual("input test1 test2 ")
  })

  test("chain 5 middlewares", async () => {
    const middleware = chainMiddleware(
      ...(Array.from({ length: 5 }, (_, index) => testMiddleware(index)) as NonEmptyArray<Middleware<any, any>>)
    )
    const response = await middleware("input ", async (_) => _)
    expect(response).toEqual("input test0 test1 test2 test3 test4 ")
  })
  
  test("handle middlewares", async () => {
<<<<<<< HEAD
    const middleware = runMiddleware(testMiddleware(1), testMiddleware(2), async (_) => _)
=======
    const middleware = handleMiddleware(testMiddleware(1), testMiddleware(2), async (_) => _)
>>>>>>> e7d1d5a (no message)
    const response = await middleware("input ")
    expect(response).toEqual("input test1 test2 ")
  })

  test("handle incomplete middlewares", async () => {
<<<<<<< HEAD
    const middleware = runMiddleware(testMiddleware(1), testMiddleware(2))
=======
    const middleware = handleMiddleware(testMiddleware(1), testMiddleware(2))
>>>>>>> e7d1d5a (no message)
    expect(async () => middleware("input ")).rejects.toThrow("Middleware chain does not handle the request fully.")
  })
})
