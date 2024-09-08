import { ZodError, ZodObject, ZodTypeAny, z } from "zod";
import { addLogHandler, consoleLogHandler, logger } from "../logging";
import { APIMiddleware } from "./TransportTypes";

const log = logger("tif.api.validation")
addLogHandler(consoleLogHandler())

const zodValidation = async (data: any, schema: ZodObject<any>, errorMessage: string) => {
    try {
        return await schema.parseAsync(data) as any
    } catch (e) {
        if (e instanceof ZodError) {
            log.error("Zod Schema Error Message", {
                zodError: JSON.parse(e.message)
            })
        }
        throw new Error(`${errorMessage}: ${JSON.stringify(data)}`)
    }
}

export const tryParseAPICall: APIMiddleware<any> = 
  async (endpointInput, next) => {
    const {endpointName, endpointSchema: {input: inputSchema, outputs: outputSchemas, constraints}, body, query, params} = endpointInput

    await zodValidation({body, query, params}, z.object(inputSchema), `Making an invalid request to TiF API endpoint ${endpointName}`)

    const response = await next(endpointInput)

    const responseSchema = outputSchemas[`status${response.status}` as keyof typeof outputSchemas] as ZodTypeAny | "no-content"

    if (!responseSchema) {
      let message = `TiF API responded with an unexpected status code ${response.status}`
      if (response.status !== 204) {
        message += ` and body ${JSON.stringify(response.data)}`
      }
      throw new Error(message)
    } else {
      if (response.status !== 204) {
        await zodValidation(
          response.data, 
          // GenericEndpointSchema does not have proper typing on constraints signature
          //@ts-expect-error
          responseSchema.refine(() => constraints ? constraints(input, response) : true), 
          `The response from TiF API endpoint ${endpointName} does not match the schema for status ${response.status}`
        )
      }
      return response
    }
  }
