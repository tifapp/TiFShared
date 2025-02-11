import {
  addLogHandler,
  consoleLogHandler,
  logger,
  resetLogHandlers
} from "../logging"
import { mockAPIServer } from "../test-helpers/mockAPIServer"
import { APIClientCreator } from "./APIClient"
import { DEFAULT_LOG } from "./APIValidation"
import { ClientExtensions, apiTransport } from "./Transport"
import { jwtMiddleware, requestLoggingMiddleware } from "./TransportMiddleware"
import { TiFAPIInputContext, endpointSchema } from "./TransportTypes"
import { z } from "zod"

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
    afterEach(() => resetLogHandlers())

    test("logs a request", async () => {
      const testHandler = jest.fn()
      addLogHandler(consoleLogHandler())
      addLogHandler(testHandler)
      const schema = {
        test: endpointSchema({
          input: {
            query: z.object({ isFiltered: z.boolean() }),
            params: z.object({ id: z.number() }),
            body: z.object({ name: z.string() })
          },
          outputs: {
            status200: z.object({ isOk: z.boolean() })
          },
          httpRequest: {
            endpoint: "/test/:id",
            method: "POST"
          }
        })
      }
      const url = new URL("https://test.api")
      const client = APIClientCreator(
        schema,
        requestLoggingMiddleware("test", "info"),
        apiTransport("test", url, logger("test.request.logging.api.transport"))
      )
      mockAPIServer(url, schema, {
        test: { mockResponse: { status: 200, data: { isOk: true } } }
      })
      await client.test({
        query: { isFiltered: true },
        params: { id: 20 },
        body: { name: "blob" }
      })

      expect(testHandler).toHaveBeenNthCalledWith(
        1,
        expect.any(String),
        "info",
        "Sending POST request to path /test/20?isFiltered=true.",
        { body: { name: "blob" }, requestId: expect.any(String) }
      )
      expect(testHandler).toHaveBeenNthCalledWith(
        2,
        expect.any(String),
        "info",
        "Received 200 response from path /test/20?isFiltered=true.",
        {
          body: { isOk: true },
          requestId: expect.any(String)
        }
      )
      expect(testHandler).toHaveBeenCalledTimes(2)
    })
  })
})
