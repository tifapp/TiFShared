import { ZodError, ZodObject, ZodTypeAny, z } from "zod";
import { logger } from "../logging";
import { EndpointSchemaToMiddleware } from "./TransportTypes";

const log = logger("tif.api.validation")

const zodValidation = async (data: any, schema: ZodObject<any>, errorMessage: string) => {
    try {
        return await schema.parseAsync(data) as any
    } catch (e) {
        if (e instanceof ZodError) {
            log.trace("Zod Schema Error Message", {
                zodError: JSON.parse(e.message)
            })
        }
        throw new Error(`${errorMessage}: ${JSON.stringify(data)}`)
    }
}

export const tryParseAPICall: EndpointSchemaToMiddleware = 
  (endpointName, {input: inputSchema, outputs, constraints}) => 
    async (input, next) => {
      await zodValidation(input ?? {}, z.object(inputSchema), `Making an invalid request to TiF API endpoint ${endpointName}`)

      const response = await next(input)

      const responseSchema = outputs[`status${response.status}` as keyof typeof outputs] as ZodTypeAny | "no-content"

      if (!responseSchema) {
        throw new Error(
          `TiF API responded with an unexpected status code ${response.status} and body ${JSON.stringify(response.data)}`
        )
      } else {
        if (responseSchema !== "no-content") {
          await zodValidation(
            response.data, 
            // GenericEndpointSchema does not have proper typing on constraints signature
            //@ts-expect-error
            responseSchema.refine(() => constraints ? constraints(input, response) : true), 
            `TiF API endpoint ${endpointName} responded with an invalid JSON body`
          )
        }
        return response
      }
    }
