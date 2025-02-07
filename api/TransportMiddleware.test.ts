import { addLogHandler, consoleLogHandler, resetLogHandlers } from "../logging"
import { ClientExtensions } from "./Transport"
import { jwtMiddleware, requestLoggingMiddleware } from "./TransportMiddleware"
import { TiFAPIInputContext } from "./TransportTypes"

describe("TiFAPITransportMiddlewareTests", () => {
  describe("JWTMiddleware tests", () => {
    const TEST_JWT = "kljdsnefijknhdfinsdifhn"

    it("should include a bearer token in the request headers with the jwt", async () => {
      const middleware = jwtMiddleware(async () => TEST_JWT)
      const next = jest.fn()
      await middleware(
        { headers: {} } as TiFAPIInputContext<ClientExtensions>,
        next
      )
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: { Authorization: `Bearer ${TEST_JWT}` }
        })
      )
    })

    it("should omit the bearer token in the request headers when no jwt", async () => {
      const middleware = jwtMiddleware(async () => undefined)
      const next = jest.fn()
      await middleware(
        { headers: {} } as TiFAPIInputContext<ClientExtensions>,
        next
      )
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ headers: {} })
      )
    })
  })

  describe("LoggingMiddleware tests", () => {
    test("logs a request", async () => {
      const testHandler = jest.fn()
      addLogHandler(consoleLogHandler())
      addLogHandler(testHandler)
      const middleware = requestLoggingMiddleware("test", "info")
      const next = jest.fn()
      await middleware(
        {
          headers: {},
          endpointName: "/test",
          endpointSchema: {
            httpRequest: {
              method: "POST"
            }
          }
        } as TiFAPIInputContext<ClientExtensions>,
        next
      )
      expect(testHandler).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledTimes(1)
      resetLogHandlers()
    })
  })
})
