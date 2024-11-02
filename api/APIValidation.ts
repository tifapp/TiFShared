import { ZodError, ZodTypeAny, z } from "zod"
import { Logger, logger } from "../logging"
import {
  APIMiddleware,
  AnyTiFAPIResponse,
  TiFAPIInputContext
} from "./TransportTypes"
import { ClientExtensions } from "./Transport"

export type ValidationResult =
  | "invalid-request"
  | "unexpected-response"
  | "invalid-response"
  | "passed"

export class APIValidationError extends Error {
  validationResult: ValidationResult

  constructor(validationResult: ValidationResult) {
    super(validationResult)
    this.name = this.constructor.name
    Object.setPrototypeOf(this, APIValidationError.prototype)
  }
}

export const DEFAULT_LOG = logger("tif.api.validation")

const zodValidation = async <T>(
  data: T,
  schema: ZodTypeAny,
  log: Logger
): Promise<T | "failure"> => {
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

export type ValidationResultParser<T> = (
  _:
    | {
        validationStatus: "invalid-request"
        requestContext: TiFAPIInputContext<T>
      }
    | {
        validationStatus: "unexpected-response" | "invalid-response" | "passed"
        requestContext: TiFAPIInputContext<T>
        response: AnyTiFAPIResponse
      }
) => AnyTiFAPIResponse

export enum APIValidationOptions {
  None = 0,
  Request = 1 << 0,
  Response = 1 << 1
}

export const API_VALIDATION_OPTIONS_ALL: APIValidationOptions =
  APIValidationOptions.Request | APIValidationOptions.Response

export const validateAPICall = <T>(
  resultParser: ValidationResultParser<T>,
  validationOptions: APIValidationOptions = API_VALIDATION_OPTIONS_ALL,
  log: Logger = DEFAULT_LOG
): APIMiddleware<T> => {
  return async (requestContext, next) => {
    const {
      endpointSchema: {
        input: inputSchema,
        outputs: outputSchemas,
        constraints
      },
      body,
      query,
      params
    } = requestContext

    let request = { body, query, params }

    if (validationOptions & APIValidationOptions.Request) {
      const validatedRequest = await zodValidation(
        request,
        z.object(inputSchema),
        log
      )

      if (validatedRequest === "failure") {
        return resultParser({
          validationStatus: "invalid-request",
          requestContext
        })
      } else {
        request = validatedRequest
      }
    }

    Object.assign(requestContext, request)

    const response = await next(requestContext)

    let validationStatus: ValidationResult = "passed"

    let responseData = response.data

    if (validationOptions & APIValidationOptions.Response) {
      const responseSchema = outputSchemas[
        `status${response.status}` as keyof typeof outputSchemas
      ] as ZodTypeAny | "no-content"

      if (!responseSchema) {
        validationStatus = "unexpected-response"
      } else if (responseSchema !== "no-content") {
        responseData = await zodValidation(
          response.data,
          responseSchema.refine(() =>
            constraints ? constraints(request, response) : true
          ),
          log
        )

        if (responseData === "failure") {
          validationStatus = "invalid-response"
        }
      }
    }

    return resultParser({
      validationStatus,
      requestContext,
      response: { status: response.status, data: responseData }
    })
  }
}

export const validateAPIClientCall = (
  apiName: string,
  log: Logger,
  validationOptions: APIValidationOptions = API_VALIDATION_OPTIONS_ALL
) => {
  return validateAPICall<ClientExtensions>(
    (result) => {
      if (result.validationStatus === "passed") {
        return result.response
      } else if (result.validationStatus === "invalid-request") {
        log.error(
          `Request to ${apiName} API endpoint ${result.requestContext.endpointName} is not valid`,
          result.requestContext
        )
      } else if (result.validationStatus === "unexpected-response") {
        log.error(
          `${apiName} API endpoint ${result.requestContext.endpointName} responded unexpectedly`,
          result.response
        )
      } else if (result.validationStatus === "invalid-response") {
        log.error(
          `Response from ${apiName} API endpoint ${result.requestContext.endpointName} does not match the expected schema`,
          result.response
        )
      }
      throw new APIValidationError(result.validationStatus)
    },
    validationOptions,
    log
  )
}
