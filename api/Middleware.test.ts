import { jwtMiddleware } from "./Middleware"

describe("TiFAPIMiddlewareTests", () => {
  describe("JWTMiddleware tests", () => {
    const TEST_JWT = "kljdsnefijknhdfinsdifhn"

    it("should include a bearer token in the request headers with the jwt", async () => {
      const middleware = jwtMiddleware(async () => TEST_JWT)
      const next = jest.fn()
      await middleware({ headers: {} } as Request, next)
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: { Authorization: `Bearer ${TEST_JWT}` }
        })
      )
    })

    it("should omit the bearer token in the request headers when no jwt", async () => {
      const middleware = jwtMiddleware(async () => undefined)
      const next = jest.fn()
      await middleware({ headers: {} } as Request, next)
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ headers: {} })
      )
    })
  })
})
