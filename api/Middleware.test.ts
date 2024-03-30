import { TiFAPIMiddleware, chainMiddleware, jwtMiddleware } from "./Middleware"

describe("TiFAPIMiddlewareTests", () => {
  describe("JWTMiddleware tests", () => {
    const TEST_JWT = "kljdsnefijknhdfinsdifhn"

    it("should include a bearer token in the request headers with the jwt", async () => {
      const middleware = jwtMiddleware(async () => TEST_JWT)
      const next = jest.fn()
      await middleware({ headers: {} }, next)
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: { Authorization: `Bearer ${TEST_JWT}` }
        })
      )
    })

    it("should omit the bearer token in the request headers when no jwt", async () => {
      const middleware = jwtMiddleware(async () => undefined)
      const next = jest.fn()
      await middleware({ headers: {} }, next)
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ headers: {} })
      )
    })
  })

  describe("ChainMiddleware tests", () => {
    const testMiddleware: TiFAPIMiddleware = async (
      request: RequestInit,
      next: (request: RequestInit) => Promise<Response>
    ) => {
      const headers = request.headers as Record<string, string> | undefined
      return await next({
        ...request,
        headers: { test: (headers?.test ?? "") + "test " }
      })
    }

    const TEST_RESPONSE = new Response("Nice", { status: 200 })

    test("chain 2 middlewares", async () => {
      const middleware = chainMiddleware(testMiddleware, testMiddleware)
      const next = jest.fn().mockResolvedValueOnce(TEST_RESPONSE)
      const response = await middleware({}, next)
      expect(response).toEqual(TEST_RESPONSE)
      expect(next).toHaveBeenCalledWith({ headers: { test: "test test " } })
    })

    test("chain 5 middlewares", async () => {
      const middleware = chainMiddleware(
        testMiddleware,
        testMiddleware,
        testMiddleware,
        testMiddleware,
        testMiddleware
      )
      const next = jest.fn().mockResolvedValueOnce(TEST_RESPONSE)
      const response = await middleware({}, next)
      expect(response).toEqual(TEST_RESPONSE)
      expect(next).toHaveBeenCalledWith({
        headers: { test: "test test test test test " }
      })
    })
  })
})
