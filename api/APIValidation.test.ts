import { z } from "zod"
import { middlewareRunner } from "../lib/Middleware"
import { addLogHandler, resetLogHandlers } from "../logging"
import { validateAPICall } from "./APIValidation"
import { GenericEndpointSchema } from "./TransportTypes"

const endpointName = "MOCK_ENDPOINT"

const apiValidator = ({validate, endpointSchema, mockRequest, mockResponse}: {
  validate?: "requestOnly" | "responseOnly"
  endpointSchema: Omit<GenericEndpointSchema, "httpRequest" | "endpointName">, 
  mockRequest: any, 
  mockResponse: any
}) =>
  middlewareRunner(
    validateAPICall((status, value) =>
      status === "passed" ? value : status
    , validate),
    async () => mockResponse
  )({ 
    endpointName,
    endpointSchema: endpointSchema as GenericEndpointSchema,
    ...mockRequest
  })

describe("validateAPICall", () => {  
  const logHandler = jest.fn()
  
  beforeAll(() => addLogHandler(logHandler))
  afterAll(() => resetLogHandlers())

  it("should throw an error if the request is invalid", async () => {
    const apiCall = apiValidator({
      endpointSchema: {
        input: {
          body: z.object({
            name: z.string(),
          })
        },
        outputs: {
          status200: z.object({
            name: z.string(),
          })
        }
      },
      mockRequest: { query: { name: "John" } },
      mockResponse: { status: 404, data: { message: "Not Found" } }
    })

    await expect(apiCall).resolves.toEqual("invalid-request");
    expect(logHandler).toHaveBeenNthCalledWith(1, "tif.api.validation", "error", "Zod Schema Error Message", {"zodError": [{"code": "invalid_type", "expected": "object", "message": "Required", "path": ["body"], "received": "undefined"}]})
    expect(logHandler).toHaveBeenNthCalledWith(2, "tif.api.validation", "error", "Request to TiF API endpoint MOCK_ENDPOINT is not valid", {"body": undefined, "params": undefined, "query": {"name": "John"}})    
  });
  
  it("can ignore request validation", async () => {
    const apiCall = apiValidator({
      endpointSchema: {
        input: {
          body: z.object({
            name: z.string(),
          })
        },
        outputs: {
          status200: z.object({
            name: z.string(),
          })
        }
      },
      mockRequest: { query: { name: "John" } },
      mockResponse: { status: 404, data: { message: "Not Found" } },
      validate: "responseOnly"
    })

    await expect(apiCall).resolves.toEqual("unexpected-response");
    expect(logHandler).toHaveBeenNthCalledWith(1, "tif.api.validation", "error", "TiF API endpoint MOCK_ENDPOINT responded unexpectedly", {"data": {"message": "Not Found"}, "status": 404})
  });

  it("should throw an error if the response status is unexpected", async () => {
    const apiCall = apiValidator({
      endpointSchema: {
        input: {
          body: z.object({
            name: z.string(),
          })
        },
        outputs: {
          status200: z.object({
            name: z.string(),
          })
        }
      },
      mockRequest: { body: { name: "John" } },
      mockResponse: { status: 404, data: { message: "Not Found" } }
    })

    await expect(apiCall).resolves.toEqual("unexpected-response");
    expect(logHandler).toHaveBeenNthCalledWith(1, "tif.api.validation", "error", "TiF API endpoint MOCK_ENDPOINT responded unexpectedly", {"data": {"message": "Not Found"}, "status": 404})
  });
  
  it("should throw an error if response is not valid", async () => {
    const apiCall = apiValidator({
      endpointSchema: {
        input: {
          body: z.object({
            name: z.string(),
          })
        },
        outputs: {
          status200: z.object({
            name: z.string(),
          })
        }
      },
      mockRequest: { body: { name: "John" } },
      mockResponse: { status: 200, data: { name: 123 } }
    })

    await expect(apiCall).resolves.toEqual("invalid-response");
    expect(logHandler).toHaveBeenNthCalledWith(1, "tif.api.validation", "error", "Zod Schema Error Message", {"zodError": [{"code": "invalid_type", "expected": "string", "message": "Expected string, received number", "path": ["name"], "received": "number"}]})
    expect(logHandler).toHaveBeenNthCalledWith(2, "tif.api.validation", "error", "Response from TiF API endpoint MOCK_ENDPOINT does not match the expected schema", {"data": {"name": 123}, "status": 200})
  });
  
  it("should throw an error if response does not match constraints", async () => {
    const apiCall = apiValidator({
      endpointSchema: {
        input: {
          body: z.object({
            name: z.string(),
          })
        },
        outputs: {
          status200: z.object({
            name: z.string(),
          })
        },
        constraints: (input: any, output: any) => { return input.body.name === output.data.name }
      },
      mockRequest: { body: { name: "John" } },
      mockResponse: { status: 200, data: { name: "Johnny" } }
    })

    await expect(apiCall).resolves.toEqual("invalid-response");
    expect(logHandler).toHaveBeenNthCalledWith(1, "tif.api.validation", "error", "Zod Schema Error Message", {"zodError": [{"code": "custom", "message": "Invalid input", "path": []}]})
    expect(logHandler).toHaveBeenNthCalledWith(2, "tif.api.validation", "error", "Response from TiF API endpoint MOCK_ENDPOINT does not match the expected schema", {"data": {"name": "Johnny"}, "status": 200})
  });
  
  it("should return response if request and response are valid", async () => {
    const apiCall = apiValidator({
      endpointSchema: {
        input: {
          body: z.object({
            name: z.string(),
          })
        },
        outputs: {
          status200: z.object({
            name: z.string(),
          })
        },
        constraints: (input: any, output: any) => { return input.body.name === output.data.name }
      },
      mockRequest: { body: { name: "John" } },
      mockResponse: { status: 200, data: { name: "John" } }
    })

    await expect(apiCall).resolves.toStrictEqual({"data": {"name": "John"}, "status": 200});
    expect(logHandler).not.toHaveBeenCalled()
  });

  it("can ignore response validation", async () => {
    const apiCall = apiValidator({
      endpointSchema: {
        input: {
          body: z.object({
            name: z.string(),
          })
        },
        outputs: {
          status200: z.object({
            name: z.string(),
          })
        }
      },
      mockRequest: { body: { name: "John" } },
      mockResponse: { status: 200, data: { name: 123 } },
      validate: "requestOnly"
    })

    await expect(apiCall).resolves.toEqual({"data": {"name": 123}, "status": 200});
    expect(logHandler).not.toHaveBeenCalled()
  });
  
  it("should allow void inputs", async () => {
    const apiCall = apiValidator({
      endpointSchema: {
        input: {},
        outputs: {
          status200: z.object({
            name: z.string(),
          })
        }
      },
      mockRequest: undefined,
      mockResponse: { status: 200, data: { name: "John" } }
    })

    await expect(apiCall).resolves.toStrictEqual(
      {"data": {"name": "John"}, "status": 200}
    );
    expect(logHandler).not.toHaveBeenCalled()
  });
  
  it("should allow no content responses", async () => {
    const apiCall = apiValidator({
      endpointSchema: {
        input: {
          body: z.object({
            name: z.string(),
          })
        },
        outputs: {
          status204: "no-content",
        }
      },
      mockRequest: { body: { name: "John" } },
      mockResponse: { status: 204, data: undefined }
    })

    await expect(apiCall).resolves.toStrictEqual(
      {"data": undefined, "status": 204}
    );
    expect(logHandler).not.toHaveBeenCalled()
  });
});