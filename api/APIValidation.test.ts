import { z } from "zod"
import { middlewareRunner } from "../lib/Middleware"
import { addLogHandler, resetLogHandlers } from "../logging"
import { APIValidationOptions, validateAPICall } from "./APIValidation"
import { AnyTiFAPIResponse, GenericEndpointSchema, TiFAPIInputContext } from "./TransportTypes"

const endpointName = "MOCK_ENDPOINT"

const apiValidator = (
  schema: Pick<GenericEndpointSchema,"input"|"outputs"|"constraints">, 
  request: TiFAPIInputContext<any>, 
  response: AnyTiFAPIResponse,
  validate: APIValidationOptions = APIValidationOptions.Request | APIValidationOptions.Response,
) =>
  middlewareRunner(
    validateAPICall(result => result.validationStatus === "passed" ? result.response : result.validationStatus as any, 
    validate),
    async () => response
  )({ 
    endpointName,
    endpointSchema: schema as unknown as GenericEndpointSchema,
    ...request
  })

const mockSchema = {
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
}

describe("validateAPICall", () => {  
  const logHandler = jest.fn()
  
  beforeAll(() => addLogHandler(logHandler))
  afterAll(() => resetLogHandlers())

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should throw an error if the request is invalid", async () => {
    const apiCall = apiValidator(
      mockSchema,
      { query: { name: "John" } },
      { status: 404, data: { message: "Not Found" } }
    )

    await expect(apiCall).resolves.toEqual("invalid-request")
    expect(logHandler).toHaveBeenNthCalledWith(1, "tif.api.validation", "error", "Zod Schema Error Message", {
      "zodError": [{
        "code": "invalid_type",
        "expected": "object",
        "message": "Required",
        "path": ["body"],
        "received": "undefined"
      }]
    })
  });
  
  it("can ignore request validation", async () => {
    const apiCall = apiValidator(
      mockSchema,
      { query: { name: "John" } },
      { status: 404, data: { message: "Not Found" } },
      APIValidationOptions.Response
    )

    await expect(apiCall).resolves.toEqual("unexpected-response")
  });

  it("should throw an error if the response status is unexpected", async () => {
    const apiCall = apiValidator(
      mockSchema,
      { body: { name: "John" } },
      { status: 404, data: { message: "Not Found" } }
    )

    await expect(apiCall).resolves.toEqual("unexpected-response")
  });
  
  it("should throw an error if response is not valid", async () => {
    const apiCall = apiValidator(
      mockSchema,
      { body: { name: "John" } },
      { status: 200, data: { name: 123 } }
    )

    await expect(apiCall).resolves.toEqual("invalid-response")
    expect(logHandler).toHaveBeenNthCalledWith(1, "tif.api.validation", "error", "Zod Schema Error Message", {
      "zodError": [{
        "code": "invalid_type",
        "expected": "string",
        "message": "Expected string, received number",
        "path": ["name"],
        "received": "number"
      }]
    })
  });
  
  it("should throw an error if response does not match constraints", async () => {
    const apiCall = apiValidator(
      {
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
        constraints: (input: any, output: any) => { 
          return input.body.name === output.data.name 
        }
      },
      { body: { name: "John" } },
      { status: 200, data: { name: "Johnny" } }
    )

    await expect(apiCall).resolves.toEqual("invalid-response")
    expect(logHandler).toHaveBeenNthCalledWith(1, "tif.api.validation", "error", "Zod Schema Error Message", {
      "zodError": [{
        "code": "custom",
        "message": "Invalid input",
        "path": []
      }]
    })
  });
  
  it("should coerce request and response", async () => {
    const inputDateTime = '2024-10-02T02:03:22.447Z'
    const outputDateTime = '2023-10-02T02:03:22.447Z'

    const apiCall = apiValidator(
      {
        input: { body: z.object({ createdDateTime: z.coerce.date() }) },
        outputs: { status200: z.object({ createdDateTime: z.coerce.date() }) },
        constraints: (input: any, output: any) => { 
          expect(input).toEqual({ body: { createdDateTime: new Date(inputDateTime) } })
          return true 
        }
      },
      { body: { createdDateTime: inputDateTime } },
      { status: 200, data: { createdDateTime: outputDateTime } }
    )

    await expect(apiCall).resolves.toMatchObject({
      data: { createdDateTime: new Date(outputDateTime) }
    })
    expect(logHandler).not.toHaveBeenCalled()
  });
  
  it("should return response if request and response are valid", async () => {
    const apiCall = apiValidator(
      {
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
        constraints: (input: any, output: any) => { 
          return input.body.name === output.data.name 
        }
      },
      { body: { name: "John" } },
      { status: 200, data: { name: "John" } }
    )

    await expect(apiCall).resolves.toStrictEqual({
      "data": { "name": "John" },
      "status": 200
    })
    expect(logHandler).not.toHaveBeenCalled()
  });

  it("can ignore response validation", async () => {
    const apiCall = apiValidator(
      mockSchema,
      { body: { name: "John" } },
      { status: 200, data: { name: 123 } },      
      APIValidationOptions.Request
    )

    await expect(apiCall).resolves.toEqual({
      "data": { "name": 123 },
      "status": 200
    })
    expect(logHandler).not.toHaveBeenCalled()
  });
  
  it("should allow void inputs", async () => {
    const apiCall = apiValidator(
      {
        ...mockSchema,
        input: {}
      },
      undefined,
      { status: 200, data: { name: "John" } }
    )

    await expect(apiCall).resolves.toStrictEqual({
      "data": { "name": "John" },
      "status": 200
    })
    expect(logHandler).not.toHaveBeenCalled()
  });
  
  it("should allow no content responses", async () => {
    const apiCall = apiValidator(
      {
        ...mockSchema,
        outputs: {
          status204: "no-content",
        }
      },
      { body: { name: "John" } },
      { status: 204, data: undefined }
    )

    await expect(apiCall).resolves.toStrictEqual({
      "data": undefined,
      "status": 204
    })
    expect(logHandler).not.toHaveBeenCalled()
  });
});