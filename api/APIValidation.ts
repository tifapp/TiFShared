import { ZodError, ZodTypeAny, z } from "zod";
import { addLogHandler, consoleLogHandler, logger } from "../logging";
import { APIMiddleware, TiFAPIInputContext, TiFAPIResponse } from "./TransportTypes";

const log = logger("tif.api.validation")
addLogHandler(consoleLogHandler())

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

export type ValidationResultParser = 
  ((_: {validationStatus: Extract<ValidationResult, "invalid-request">, request: TiFAPIInputContext<any>} 
    | {validationStatus: Extract<ValidationResult, "unexpected-response" | "invalid-response">, response: TiFAPIResponse<any>} 
    | {validationStatus: Extract<ValidationResult, "passed">, response: TiFAPIResponse<any>}
  ) => (TiFAPIResponse<any>))

export const VALIDATE_REQUEST = 1 << 0
export const VALIDATE_RESPONSE = 1 << 1
export const VALIDATE_NONE = 0
export type APICallValidateOptions = number

// NB: Currently needs to be annotated with "any" in order for typescript to mark it compatible with more specific middleware like TiFAPITransport
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateAPICall = (resultParser: ValidationResultParser, validationOptions: APICallValidateOptions = VALIDATE_REQUEST | VALIDATE_RESPONSE): APIMiddleware<any> => 
  async (endpointInput, next) => {
    const {endpointName, endpointSchema: {input: inputSchema, outputs: outputSchemas, constraints}, body, query, params} = endpointInput

    let validationStatus: ValidationResult = "passed"

    let request = {body, query, params}

    if (validationOptions & VALIDATE_REQUEST) {
      const validatedRequest = await zodValidation(request, z.object(inputSchema))
      
      if (validatedRequest === "failure") {
        validationStatus = "invalid-request" as const
        log.error(`Request to TiF API endpoint ${endpointName} is not valid`, request)
        return resultParser({validationStatus, request})
      } else {
        request = validatedRequest
      }
    }

    Object.assign(endpointInput, request)

    const response = await next(endpointInput)
    
    let responseData = response.data;

    if (validationOptions & VALIDATE_RESPONSE) {
      const responseSchema = outputSchemas[`status${response.status}` as keyof typeof outputSchemas] as ZodTypeAny | "no-content"

      if (!responseSchema) {
        validationStatus = "unexpected-response"
        log.error(`TiF API endpoint ${endpointName} responded unexpectedly`, response)
      } else if (responseSchema !== "no-content") {
        responseData = await zodValidation(
          response.data, 
          responseSchema.refine(() => constraints ? constraints(request, response) : true),
        )
        
        if (responseData === "failure") {
          validationStatus = "invalid-response"
          log.error(`Response from TiF API endpoint ${endpointName} does not match the expected schema`, response)
        }
      }
    }

    return resultParser({validationStatus, response: {status: response.status, data: responseData}})
  }
