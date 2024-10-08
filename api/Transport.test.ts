/* eslint-disable @typescript-eslint/naming-convention */
import { HttpResponse, http } from "msw"
import { URLEndpoint } from "../lib/URL"
import { addLogHandler, consoleLogHandler, resetLogHandlers } from "../logging"
import { mswServer, noContentResponse } from "../test-helpers/MSW"
import { tifAPITransport } from "./Transport"
import { GenericEndpointSchema, HTTPMethod } from "./TransportTypes"

const TEST_BASE_URL = "http://localhost:8080"
const TEST_ENDPOINT = "/test"

const apiFetch = ({method, body, query, params, signal, endpoint}: 
  {method: HTTPMethod, body?: any, query?: any, params?: any, signal?: AbortSignal, endpoint?: URLEndpoint}
) => 
  tifAPITransport(
    new URL(TEST_BASE_URL)
  )({
    endpointName: "TEST",
    endpointSchema: ({httpRequest: {method, endpoint: endpoint ?? TEST_ENDPOINT}} as GenericEndpointSchema),
    body,
    query,
    params,
    signal
  })

const successResponse = () => HttpResponse.json({ a: 1 })

describe("TiFAPITransport tests", () => {
  beforeAll(() => addLogHandler(consoleLogHandler()))
  afterAll(() => resetLogHandlers())

  test("api client fetch", async () => {
    mswServer.use(
      http.post(`${TEST_BASE_URL}${TEST_ENDPOINT}/:id`, async ({ request, params }) => {
        const body: any = await request.json()
        const searchParams = new URL(request.url).searchParams

        expect(request.headers.get("Content-Type")).toBe("application/json")
        expect(params.id).toBe("abc")
        expect(searchParams.get("hello")).toBe("world")
        expect(searchParams.get("a")).toBe("1")
        expect(body?.a).toBe(1)
        expect(body?.b).toBe("hello")

        return successResponse()
      })
    )

    const resp = await apiFetch({
      method: "POST", 
      endpoint: `${TEST_ENDPOINT}/:id`, 
      params: { id: "abc" },
      query: { hello: "world", a: 1 },
      body: { a: 1, b: "hello" }
    })

    expect(resp).toMatchObject({
      status: 200,  
      data: { a: 1 }
    })
  })
  
  test("api client fetch, undefined body", async () => {
    mswServer.use(
      http.post(`${TEST_BASE_URL}${TEST_ENDPOINT}`, async () => {
        return successResponse()
      })
    )

    const resp = await apiFetch({
      method: "POST",
      body: undefined
    })

    expect(resp).toMatchObject({
      status: 200,
      data: { a: 1 }
    })
  })

  test("api client fetch, undefined query param", async () => {
    mswServer.use(
      http.get(`${TEST_BASE_URL}${TEST_ENDPOINT}`, async ({ request }) => {
        if (new URLSearchParams(request.url).has("hello")) {
          return new HttpResponse(null, { status: 500 })
        }
        return successResponse()
      })
    )

    const resp = await apiFetch({
      method: "GET",
      query: { hello: undefined }
    })

    expect(resp).toMatchObject({
      status: 200,
      data: { a: 1 }
    })
  })

  test("api client fetch, no body", async () => {
    mswServer.use(
      http.get(`${TEST_BASE_URL}${TEST_ENDPOINT}`, async ({ request }) => {
        expect(async () => request.json()).rejects.toThrow()

        return successResponse()
      })
    )

    const resp = await apiFetch({method: "GET"})

    expect(resp).toMatchObject({
      status: 200,
      data: { a: 1 }
    })
  })

  test("api client fetch, json not returned from API", async () => {
    mswServer.use(
      http.get(`${TEST_BASE_URL}${TEST_ENDPOINT}`, async () => {
        return new HttpResponse("LMAO", { status: 200 })
      })
    )

    await expect(apiFetch({method: "GET"})).rejects.toEqual(
      new Error("TiF API responded with non-JSON body and status 200.")
    )
  })

  test("api client fetch, empty body on 204", async () => {
    mswServer.use(
      http.get(`${TEST_BASE_URL}${TEST_ENDPOINT}`, async () => {
        return noContentResponse()
      })
    )

    const resp = await apiFetch({method: "GET"})

    expect(resp.data).toEqual(undefined)
  })

  test("api client fetch, non-empty body on 204", async () => {
    mswServer.use(
      http.get(`${TEST_BASE_URL}${TEST_ENDPOINT}`, async () => {
        return HttpResponse.json({ hello: "world" }, { status: 204 })
      })
    )

    await expect(
      apiFetch({method: "GET"})
    ).rejects.toEqual(
      new Error(
        'TiFAPI responded with a 204 status code and body {"hello":"world"}. A 204 status code should not produce a body.'
      )
    )
  })

  test("logs error", async () => {
    mswServer.use(
      http.get(`${TEST_BASE_URL}${TEST_ENDPOINT}`, async () => {
        throw new Error()
      })
    )

    const logHandler = jest.fn()
    addLogHandler(logHandler)
    const respPromise = apiFetch({
      method: "GET"
    })

    await expect(respPromise).rejects.toThrow("Failed to fetch")
    expect(logHandler).toHaveBeenCalledWith(
      "tif.api.client", 
      "error", 
      "Failed to make tif API request.", 
      {
        "endpointName": "TEST",
        "error": new Error("Failed to fetch"), 
        "errorMessage": "Failed to fetch"
      }
    )
    resetLogHandlers()
  })

  test("cancellation, does not log error", async () => {
    mswServer.use(
      http.get(`${TEST_BASE_URL}${TEST_ENDPOINT}`, async () => {
        await new Promise<void>(() => {})
      }),
    )

    const logHandler = jest.fn()
    addLogHandler(logHandler)
    const controller = new AbortController()
    const respPromise = apiFetch({
      method: "GET",
      signal: controller.signal
    })

    process.nextTick(() => controller.abort())
    await expect(respPromise).rejects.toThrow("This operation was aborted")
    expect(logHandler).not.toHaveBeenCalled()
    resetLogHandlers()
  })
})
