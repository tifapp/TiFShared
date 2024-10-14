import { ZodError, ZodTypeAny, z } from "zod";
import { logger } from "../logging";
import { APIMiddleware, AnyTiFAPIResponse, TiFAPIInputContext } from "./TransportTypes";

const log = logger("tif.api.validation")

const zodValidation = async <T>(data: T, schema: ZodTypeAny): Promise<T | "failure"> => {
  try {
      return await schema.parseAsync(data);
  } catch (e) {
      if (e instanceof ZodError) {
          log.error("Zod Schema Error Message", {
              zodError: JSON.parse(e.message)
          });
      } else {
          log.error(e);
      }
      return "failure";
  }
};

export type ValidationResult = "invalid-request" | "unexpected-response" | "invalid-response" | "passed"

export type ValidationResultParser<T> = 
  (_: {
    validationStatus: "invalid-request", 
    requestContext: TiFAPIInputContext<T>
  } | {
    validationStatus: "unexpected-response" | "invalid-response" | "passed", 
    requestContext: TiFAPIInputContext<T>, 
    response: AnyTiFAPIResponse
  }) => AnyTiFAPIResponse

export enum APIValidationOptions {
  None = 0,
  Request = 1 << 0,
  Response = 1 << 1
}

export const validateAPICall = <T>(resultParser: ValidationResultParser<T>, validationOptions: APIValidationOptions = APIValidationOptions.Request | APIValidationOptions.Response): APIMiddleware<T> => 
  async (requestContext, next) => {
    const {endpointSchema: {input: inputSchema, outputs: outputSchemas, constraints}, body, query, params} = requestContext

    let request = {body, query, params}

    if (validationOptions & APIValidationOptions.Request) {
      const validatedRequest = await zodValidation(request, z.object(inputSchema))
      
      if (validatedRequest === "failure") {
        return resultParser({validationStatus: "invalid-request", requestContext})
      } else {
        request = validatedRequest
      }
    }

    Object.assign(requestContext, request)

    const response = await next(requestContext)
    
    let validationStatus: ValidationResult = "passed"

    let responseData = response.data;

    if (validationOptions & APIValidationOptions.Response) {
      const responseSchema = outputSchemas[`status${response.status}` as keyof typeof outputSchemas] as ZodTypeAny | "no-content"

      if (!responseSchema) {
        validationStatus = "unexpected-response"
      } else if (responseSchema !== "no-content") {
        responseData = await zodValidation(
          response.data, 
          responseSchema.refine(() => constraints ? constraints(request, response) : true),
        )
        
        if (responseData === "failure") {
          validationStatus = "invalid-response"
        }
      }
    }

    return resultParser({validationStatus, requestContext, response: {status: response.status, data: responseData}})
  }
