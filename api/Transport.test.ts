/* eslint-disable @typescript-eslint/naming-convention */
import { HttpResponse, http } from "msw"
import { z } from "zod"
import { noContentResponse, mswServer } from "../test-helpers/MSW"
import { tifAPITransport } from "./Transport"
import { jwtMiddleware } from "./Middleware"
import { addLogHandler, resetLogHandlers } from "../logging"

const TEST_BASE_URL = new URL("http://localhost:8080")

const TEST_JWT = "this is a totally a JWT"

const apiFetch = tifAPITransport(
  TEST_BASE_URL,
  jwtMiddleware(async () => TEST_JWT)
)

const successResponse = () => HttpResponse.json({ a: 1 })

const badResponse = (status: number) => {
  return HttpResponse.json({ b: "bad" }, { status })
}

const TestResponseSchema = {
  status400: z.object({ b: z.string() }),
  status200: z.object({ a: z.number() })
}

describe("TiFAPITransport tests", () => {
  beforeEach(() => {
    mswServer.use(
      http.post("http://localhost:8080/test", async ({ request }) => {
        // TODO: Use helper method for creating httpresponses
        // https://mswjs.io/docs/migrations/1.x-to-2.x#response-declaration
        const errorResp = badResponse(400) as any
        const body: any = await request.json()
        const searchParams = new URL(request.url).searchParams

        if (request.headers.get("Authorization") !== `Bearer ${TEST_JWT}`) {
          return errorResp
        }
        if (
          searchParams.get("hello") !== "world" ||
          searchParams.get("a") !== "1"
        ) {
          return errorResp
        }

        if (body?.a !== 1 || body?.b !== "hello") {
          return errorResp
        }
        return successResponse()
      }),
      http.get("http://localhost:8080/test2", async ({ request }) => {
        try {
          await request.json()
          return badResponse(400) as any
        } catch {
          return successResponse()
        }
      }),
      http.get("http://localhost:8080/test3", async () => {
        return badResponse(500)
      }),
      http.get("http://localhost:8080/test4", async () => {
        return new HttpResponse("LMAO", { status: 200 })
      }),
      http.get("http://localhost:8080/test5", async () => {
        return badResponse(200)
      }),
      http.get("http://localhost:8080/test6", async () => {
        return noContentResponse()
      }),
      http.get("http://localhost:8080/test7", async () => {
        await new Promise<void>(() => {})
        return new HttpResponse(null, { status: 500 })
      }),
      http.get("http://localhost:8080/test8", async ({ request }) => {
        if (new URLSearchParams(request.url).has("hello")) {
          return new HttpResponse(null, { status: 500 })
        }
        return successResponse()
      }),
      http.get("http://localhost:8080/test9", async () => {
        return HttpResponse.json({ hello: "world" }, { status: 204 })
      })
    )
  })

  test("api client fetch", async () => {
    const resp = await apiFetch(
      {
        method: "POST",
        endpoint: "/test",
        query: { hello: "world", a: 1 },
        body: { a: 1, b: "hello" }
      },
      TestResponseSchema
    )

    expect(resp).toMatchObject({
      status: 200,
      data: { a: 1 }
    })
  })

  test("api client fetch, undefined query", async () => {
    const resp = await apiFetch(
      {
        method: "GET",
        endpoint: "/test8",
        query: { hello: undefined }
      },
      TestResponseSchema
    )

    expect(resp).toMatchObject({
      status: 200,
      data: { a: 1 }
    })
  })

  test("api client fetch, no body", async () => {
    const resp = await apiFetch(
      {
        method: "GET",
        endpoint: "/test2"
      },
      TestResponseSchema
    )

    expect(resp).toMatchObject({
      status: 200,
      data: { a: 1 }
    })
  })

  test("api client fetch, response code not in schema", async () => {
    expect(
      apiFetch(
        {
          method: "GET",
          endpoint: "/test3"
        },
        TestResponseSchema
      )
    ).rejects.toEqual(
      new Error(
        'TiF API responded with an unexpected status code 500 and body {"b":"bad"}'
      )
    )
  })

  test("api client fetch, json not returned from API", async () => {
    expect(
      apiFetch(
        {
          method: "GET",
          endpoint: "/test4"
        },
        TestResponseSchema
      )
    ).rejects.toEqual(
      new Error("TiF API responded with non-JSON body and status 200.")
    )
  })

  test("api client fetch, invalid json returned from API", async () => {
    expect(
      apiFetch(
        {
          method: "GET",
          endpoint: "/test5"
        },
        TestResponseSchema
      )
    ).rejects.toEqual(
      new Error(
        'TiF API responded with an invalid JSON body {"b":"bad"} and status 200.'
      )
    )
  })

  test("api client fetch, empty body on 204, response schema doesn't list a 204 response", async () => {
    expect(
      apiFetch(
        {
          method: "GET",
          endpoint: "/test6"
        },
        TestResponseSchema
      )
    ).rejects.toEqual(
      new Error(
        'TiF API responded with an unexpected status code 204 and body ""'
      )
    )
  })

  test("api client fetch, empty body on 204, response schema lists a 204 response", async () => {
    const resp = await apiFetch(
      {
        method: "GET",
        endpoint: "/test6"
      },
      { ...TestResponseSchema, status204: "no-content" }
    )

    expect(resp.data).toMatchObject({})
  })

  test("api client fetch, non-empty body on 204, response schema lists a 204 response", async () => {
    expect(
      apiFetch(
        {
          method: "GET",
          endpoint: "/test9"
        },
        { ...TestResponseSchema, status204: "no-content" }
      )
    ).rejects.toEqual(
      new Error(
        'TiFAPI responded with a 204 status code and body {"hello":"world"}. A 204 status code should not produce a body.'
      )
    )
  })

  test("cancellation", async () => {
    const controller = new AbortController()
    const respPromise = apiFetch(
      {
        method: "GET",
        endpoint: "/test7"
      },
      TestResponseSchema,
      controller.signal
    )

    process.nextTick(() => controller.abort())

    await expect(respPromise).rejects.toThrow(
      new DOMException("This operation was aborted")
    )
  })

  test("cancellation, does not log error", async () => {
    const logHandler = jest.fn()
    addLogHandler(logHandler)
    const controller = new AbortController()
    const respPromise = apiFetch(
      {
        method: "GET",
        endpoint: "/test7"
      },
      TestResponseSchema,
      controller.signal
    )

    process.nextTick(() => controller.abort())
    await expect(respPromise).rejects.toThrow()
    expect(logHandler).not.toHaveBeenCalled()
    resetLogHandlers()
  })
})
