import { ZodError, ZodTypeAny, z } from "zod";
import { addLogHandler, consoleLogHandler, logger } from "../logging";
import { APIMiddleware, TiFAPIInputContext, TiFAPIResponse } from "./TransportTypes";

const log = logger("tif.api.validation")
addLogHandler(consoleLogHandler())

const zodValidation = async (data: unknown, schema: ZodTypeAny) => {
    try {
        return await schema.parseAsync(data)
    } catch (e) {
        if (e instanceof ZodError) {
          log.error("Zod Schema Error Message", {
              zodError: JSON.parse(e.message)
          })
        } else {
          log.error(e)
        }
        return "failure"
    }
}

type ValidationResult = "invalid-request" | "unexpected-response" | "invalid-response" | "passed"

// TODO: fix value type should not be any
type ValidationResultParser = (status: ValidationResult, value: TiFAPIInputContext<any> | TiFAPIResponse<any>) => (TiFAPIResponse<any>)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateAPICall = (resultParser: ValidationResultParser): APIMiddleware<any> => 
  async (endpointInput, next) => {
    const {endpointName, endpointSchema: {input: inputSchema, outputs: outputSchemas, constraints}, body, query, params} = endpointInput

    let result: ValidationResult = "passed"

    console.log("comparing this")
    console.log({body, query, params})
    console.log(inputSchema)
    const validatedRequest = await zodValidation({body, query, params}, z.object(inputSchema))

    if (validatedRequest === "failure") {
      result = "invalid-request"
      log.error(`Request to TiF API endpoint ${endpointName} is not valid`, validatedRequest)
      return resultParser(result, validatedRequest)
    }

    console.log("untouched input is")
    console.log(endpointInput)
    console.log("new input is")
    console.log(validatedRequest)

    Object.assign(endpointInput, validatedRequest)

    const response = await next(endpointInput)

    const responseSchema = outputSchemas[`status${response.status}` as keyof typeof outputSchemas] as ZodTypeAny | "no-content"

    if (!responseSchema) {
      result = "unexpected-response"
      log.error(`TiF API endpoint ${endpointName} responded unexpectedly`, response)
    } else if (responseSchema !== "no-content") {
      if (await zodValidation(
        response.data, 
        responseSchema.refine(() => constraints ? constraints(validatedRequest, response) : true),
      ) === "failure") {
        result = "invalid-response"
        log.error(`Response from TiF API endpoint ${endpointName} does not match the expected schema`, response)
      }
    }

    return resultParser(result, response)
  }
