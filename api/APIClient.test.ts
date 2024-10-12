import { z } from "zod";
import { mockAPIServer, mockEndpointSchema } from "../test-helpers/mockAPIServer";
import { APIClientCreator } from "./APIClient";
import { TEST_API_URL, validateAPIClientCall } from "./TiFAPI";
import { tifAPITransport } from "./Transport";
import { APISchema } from "./TransportTypes";

const TEST_BASE_URL = "http://localhost:8080"

const mockAPI = <T extends APISchema>(endpointSchema: T, expectedRequest?: any, mockResponse?: any, handler?: any) => {
  mockAPIServer(new URL(TEST_BASE_URL), endpointSchema, {checkUser: {expectedRequest, mockResponse, handler}} as any)

  return APIClientCreator(    
    endpointSchema,
    validateAPIClientCall,
    tifAPITransport(TEST_API_URL)
  )
}

describe("MockAPIServer tests", () => {  
  it("should throw an error when performing an unexpected request", async () => {
    const apiClient = mockAPI(
      mockEndpointSchema("GET", { query: z.object({ name: z.string(), }) }),
      { query: { name: "John" } } as any
    )

    let error = undefined;

    try {
      await apiClient.checkUser({query: {name: "Johnny"}} as any)
    } catch (e) {
      // NB: error occurs in the mock api server so it can't be caught normally
      error = e.cause.matcherResult.message.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');
    }

     expect(error).toEqual(
      `expect(received).toMatchObject(expected)

- Expected  - 1
+ Received  + 1

  Object {
    "query": Object {
-     "name": "John",
+     "name": "Johnny",
    },
  }`
    )
  }),
  
  
  it("should perform a valid GET request", async () => {
    const mockResponse = { 
      status: 200,
      data: { name: 'John Doe' }
    }

    const apiClient = mockAPI(
      mockEndpointSchema("GET", { query: z.object({ name: z.string(), }) }, { status200: z.object({ name: z.string() }) }),
      undefined,
      mockResponse
    )

    await expect(
      apiClient.checkUser({ query: { name: "John" } } as any)
    ).resolves.toStrictEqual(mockResponse)
  })

  it("should perform a valid POST request with an undefined body", async () => {
    const mockResponse = { 
      status: 200,
      data: { name: 'John Doe' }
    }

    const apiClient = mockAPI(
      mockEndpointSchema("POST", { body: z.undefined() }, { status200: z.object({ name: z.string() })}),
      { body: undefined },
      mockResponse
    )

    await expect(
      apiClient.checkUser({ body: undefined } as any)
    ).resolves.toStrictEqual(mockResponse)
  })
})

describe("APIClient tests", () => {
  it("should throw an error when performing an invalid request", async () => {
    const apiClient = mockAPI(
      mockEndpointSchema("GET", { query: z.object({ name: z.string(), }) }),
    )

    await expect(
      apiClient.checkUser()
    ).rejects.toThrow(
      new Error("invalid-request")
    )
  })

  it("should throw an error when performing GET request with a body", async () => {
    const apiClient = mockAPI(
      mockEndpointSchema("GET", { body: z.object({ name: z.string(), }) }),
    )

    await expect(
      apiClient.checkUser({body: {name: "Johnny"}} as any)
    ).rejects.toEqual(
      new Error(
        "Request with GET/HEAD method cannot have body"
      )
    )
  })
  
  it("should throw an error when server returns unexpected data", async () => {
    const apiClient = mockAPI(
      mockEndpointSchema("GET", {}, { status204: "no-content" }),
      undefined,
      { status: 200, data: { name: 'John Doe' } }
    )

    await expect(
      apiClient.checkUser()
    ).rejects.toEqual(
      new Error("unexpected-response")
    )
  })
  
  it("should throw an error when server returns invalid data", async () => {
    const apiClient = mockAPI(
      mockEndpointSchema("GET", {}, { status200: z.object({ age: z.number() }) }),
      undefined,
      { status: 200, data: { name: 'John Doe' } }
    )

    await expect(
      apiClient.checkUser()
    ).rejects.toEqual(
      new Error("invalid-response")
    )
  })
  
  it("should perform a valid POST request", async () => {
    let savedRequest = undefined;

    const apiClient = mockAPI(
      mockEndpointSchema(
        "POST", 
        { body: z.object({ name: z.string() }) }, 
        {
          status200: z.object({
            age: z.number()
          })
        }
      ),
      undefined,
      { 
        status: 200,
        data: { age: 30 }
      },
      (request) => savedRequest = request ?? undefined
    )

    await expect(
      apiClient.checkUser({ body: { name: "John" } } as any)
    ).resolves.toStrictEqual(
      {
        status: 200,
        data: { age: 30 }
      }
    )
    expect(savedRequest).toMatchObject({ body: { name: "John" } })
  })
  
  it("should allow no-content responses", async () => {
    const apiClient = mockAPI(
      mockEndpointSchema("GET", {}, { status204: "no-content" }),
      undefined,
      { status: 204, data: undefined }
    )

    await expect(
      apiClient.checkUser()
    ).resolves.toStrictEqual({
      status: 204,
      data: undefined
    })
  })
})
