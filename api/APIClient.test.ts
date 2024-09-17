import { z } from "zod";
import { MockAPIImplementation, mockAPIServer } from "../test-helpers/mockAPIServer";
import { APIClientCreator } from "./APIClient";
import { validateAPICall } from "./APIValidation";
import { TEST_API_URL } from "./TiFAPI";
import { tifAPITransport } from "./Transport";
import { APISchema, EndpointSchemasToFunctions, HTTPMethod } from "./TransportTypes";

const TEST_BASE_URL = "http://localhost:8080"
const TEST_ENDPOINT = "/test"

const mockAPI = <T extends APISchema>({endpointSchema, endpointMocks}: {
  endpointSchema: T,
  endpointMocks: {
    [EndpointName in keyof EndpointSchemasToFunctions<T>]: MockAPIImplementation<EndpointSchemasToFunctions<T>[EndpointName]>
  }
}) => 
  mockAPIServer(new URL(TEST_BASE_URL), endpointSchema, endpointMocks)

const apiClient = <T extends APISchema>(endpointSchema: T) => 
  APIClientCreator(    
    endpointSchema,
    validateAPICall((_,value) => value),
    tifAPITransport(TEST_API_URL)
  )

describe("APIClient tests", () => {
  it("should throw an error when performing an invalid request", async () => {
    const endpointSchema = {
      checkUser: {
        input: {
          query: z.object({
            name: z.string(),
          })
        },
        outputs: {
          status204: "no-content"
        },
        httpRequest: {
          method: "GET" as HTTPMethod,
          endpoint: TEST_ENDPOINT
        }
      }
    } as APISchema

    mockAPI(
      {
        endpointSchema,
        endpointMocks: {
          checkUser: {
            mockResponse: { 
              status: 200,
              data: undefined
            } as unknown as never
          }
        }
      }
    )

    await expect(
      apiClient(endpointSchema).checkUser()
    ).rejects.toThrow(
      new Error("Making an invalid request to TiF API endpoint checkUser: {}")
    )
  })
  
  it("should throw an error when performing an unexpected request", async () => {
    const endpointSchema = {
      checkUser: {
        input: {
          query: z.object({
            name: z.string(),
          })
        },
        outputs: {
          status204: "no-content"
        },
        httpRequest: {
          method: "GET" as HTTPMethod,
          endpoint: TEST_ENDPOINT
        }
      }
    } as APISchema

    mockAPI(
      {
        endpointSchema,
        endpointMocks: {
          checkUser: {
            expectedRequest: {query: {name: "John"}} as any,
            mockResponse: { 
              status: 200,
              data: undefined
            } as unknown as never
          }
        }
      }
    )

    await expect(
      apiClient(endpointSchema).checkUser({query: {name: "Johnny"}} as any)
    ).rejects.toThrow(
      new Error(`TiF API responded with an unexpected status code 500 and body \
{\
"endpoint":"/test",\
"expectedRequest":{"query":{"name":"John"}},\
"actualRequest":{"params":{},"query":{"name":"Johnny"}}\
}`
      )
    )
  })

  it("should throw an error when performing GET request with a body", async () => {
    const endpointSchema = {
      checkUser: {
        input: {
          body: z.object({
            name: z.string(),
          })
        },
        outputs: {
          status200: z.object({
            name: z.string()
          })
        },
        httpRequest: {
          method: "GET" as HTTPMethod,
          endpoint: TEST_ENDPOINT
        }
      }
    } as APISchema

    mockAPI(
      {
        endpointSchema,
        endpointMocks: {
          checkUser: {
            expectedRequest: {
              body: { name: "John" }
            } as any,
            mockResponse: { 
              status: 200,
              data: { name: 'John Doe' }
            } as unknown as never
          }
        }
      }
    )

    await expect(
      apiClient(endpointSchema).checkUser({body: {name: "Johnny"}} as any)
    ).rejects.toEqual(
      new Error(
        "Request with GET/HEAD method cannot have body"
      )
    )
  })
  
  it("should throw an error when server returns invalid data", async () => {
    const endpointSchema = {
      checkUser: {
        input: {},
        outputs: {
          status204: "no-content"
        },
        httpRequest: {
          method: "GET" as HTTPMethod,
          endpoint: TEST_ENDPOINT
        }
      }
    } as APISchema

    mockAPI(
      {
        endpointSchema,
        endpointMocks: {
          checkUser: {
            expectedRequest: undefined,
            mockResponse: { 
              status: 200,
              data: { name: 'John Doe' }
            } as unknown as never
          }
        }
      }
    )

    await expect(
      apiClient(endpointSchema).checkUser()
    ).rejects.toEqual(
      new Error(
        `TiF API responded with an unexpected status code 200 and body {"name":"John Doe"}`
      )
    )
  })
  
  it("should perform a valid GET request", async () => {
    const endpointSchema = {
      checkUser: {
        input: {
          query: z.object({
            name: z.string(),
          })
        },
        outputs: {
          status200: z.object({
            name: z.string(),
            age: z.number()
          })
        },
        httpRequest: {
          method: "GET" as HTTPMethod,
          endpoint: TEST_ENDPOINT
        }
      }
    } as APISchema

    mockAPI(
      {
        endpointSchema,
        endpointMocks: {
          checkUser: {
            expectedRequest: {
              query: { name: "John" }
            } as any,
            mockResponse: { 
              status: 200,
              data: { name: 'John Doe', age: 30 }
            } as unknown as never
          }
        }
      }
    )

    await expect(
      apiClient(endpointSchema).checkUser({ query: { name: "John" } } as any)
    ).resolves.toStrictEqual({
      status: 200,
      data: { name: 'John Doe', age: 30 }
    })
  })
  
  it("should perform a valid POST request", async () => {
    const endpointSchema = {
      checkUser: {
        input: {
          body: z.object({
            name: z.string(),
          })
        },
        outputs: {
          status200: z.object({
            name: z.string(),
            age: z.number()
          })
        },
        httpRequest: {
          method: "POST" as HTTPMethod,
          endpoint: TEST_ENDPOINT
        }
      }
    } as APISchema

    let savedRequest = undefined;

    mockAPI(
      {
        endpointSchema,
        endpointMocks: {
          checkUser: {
            expectedRequest: {
              body: { name: "John" }
            } as any,
            handler: (request) => savedRequest = request ?? undefined,
            mockResponse: { 
              status: 200,
              data: { name: 'John Doe', age: 30 }
            } as unknown as never
          }
        }
      }
    )

    await expect(
      apiClient(endpointSchema).checkUser({ body: { name: "John" } } as any)
    ).resolves.toStrictEqual({
      status: 200,
      data: { name: 'John Doe', age: 30 }
    })
    expect(savedRequest).toMatchObject({ body: { name: "John" } })
  })
  
  it("should allow no-content responses", async () => {
    const endpointSchema = {
      checkUser: {
        input: {},
        outputs: {
          status204: "no-content"
        },
        httpRequest: {
          method: "GET" as HTTPMethod,
          endpoint: TEST_ENDPOINT
        }
      }
    } as APISchema

    mockAPI(
      {
        endpointSchema,
        endpointMocks: {
          checkUser: {
            mockResponse: { 
              status: 204,
              data: undefined
            } as unknown as never
          }
        }
      }
    )

    await expect(
      apiClient(endpointSchema).checkUser()
    ).resolves.toStrictEqual({
      status: 204,
      data: undefined
    })
  })
})

// describe("implementAPIMiddleware tests", () => {  
//   it("should allow custom implementations per endpoint", async () => {
//     const endpointSchema = {
//       checkUser: {
//         input: {},
//         outputs: {
//           status200: z.object({
//             name: z.string()
//           })
//         }
//       },
//       updateUser: {
//         input: {
//           body: z.object({
//             id: z.number()
//           })
//         },
//         outputs: {
//           status204: "no-content"
//         }
//       }
//     } as any as APISchema

//     const client = implementAPI(
//       endpointSchema,
//       undefined,
//       {
//         checkUser: async () => ({status: 200, data: {name: "Drake"}}) as never,
//         updateUser: async () => ({status: 204, data: undefined}) as never
//       }
//     )

//     await expect(
//       client.checkUser()
//     ).resolves.toStrictEqual({
//       status: 200,
//       data: {name: "Drake"}
//     })
    
//     await expect(
//       client.updateUser({body: {id: 123}} as any)
//     ).resolves.toStrictEqual({
//       status: 204,
//       data: undefined
//     })
//   })
// })
