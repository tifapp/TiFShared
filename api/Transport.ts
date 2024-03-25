import { JSONSerializableValue, Reassign } from "../lib/HelperTypes"
import { logger } from "../logging"
import { ToStringable } from "../lib/String"
import { ZodSchema, ZodType, z } from "zod"
import { TiFAPIMiddleware } from "./Middleware"

export type TiFHTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export type TiFAPIRequestQueryParameters = {
  [key: string]: ToStringable | undefined
}

export type TiFAPINoContentSchema = "no-content"

export type TiFAPIEndpoint = `/${string}`

export type BaseTiFAPIRequest<Method extends TiFHTTPMethod> = {
  method: Method
  endpoint: TiFAPIEndpoint
  body?: { [key: string]: JSONSerializableValue }
  query?: TiFAPIRequestQueryParameters
}

/**
 * A type defining an API request to the backend.
 */
export type TiFAPIRequest<Method extends TiFHTTPMethod> = Method extends "GET"
  ? Reassign<BaseTiFAPIRequest<Method>, "body", undefined>
  : BaseTiFAPIRequest<Method>

type StatusCodeMap = {
  status200: 200
  status201: 201
  status204: 204
  status400: 400
  status401: 401
  status403: 403
  status404: 404
  status429: 429
  status500: 500
}

/**
 * A type mapping a zod schema to an http status code. The keys of the object
 * must be in the form `statusXXX`.
 */
export type TiFAPIResponseSchemas = Partial<{
  [key in keyof StatusCodeMap]: key extends "status204"
    ? TiFAPINoContentSchema
    : ZodType
}>

const EmptyObjectSchema = z.object({})

type SchemaFor<
  Key extends keyof StatusCodeMap,
  Schemas extends TiFAPIResponseSchemas
> = Key extends "status204"
  ? Schemas[Key] extends TiFAPINoContentSchema
    ? typeof EmptyObjectSchema
    : undefined
  : Schemas[Key]

/**
 * A union type mapping a status code to the infered type of a ZodSchema.
 */
export type TiFAPIResponse<Schemas extends TiFAPIResponseSchemas> = {
  [key in keyof StatusCodeMap]: SchemaFor<key, Schemas> extends ZodType
    ? {
        status: StatusCodeMap[key]
        data: z.infer<SchemaFor<key, Schemas>>
      }
    : never
}[keyof StatusCodeMap]

const FETCH_RESPONSE_EMPTY_BODY = ""

const log = logger("tif.api.client")

/**
 * Creates a low-level fetch function to fetch from the TiF API.
 *
 * This lower level fetch handles automatic session tracking and
 * response parsing. The {@link TiFAPI} class provides a set of
 * high-level wrapper functions that utilize this low level
 * fetch function.
 *
 * ```ts
 * const apiFetch = tifAPITransport(
 *   TEST_BASE_URL,
 *   middleware
 * )
 *
 * const ResponseSchema = {
 *   status400: z.object({ b: z.string() }),
 *   status200: z.object({ a: z.number() })
 * }
 *
 * const resp = await apiFetch(
 *   {
 *     method: "POST",
 *     endpoint: "/test",
 *     query: { hello: "world", a: 1 },
 *     body: { a: 1, b: "hello" }
 *   },
 *   ResponseSchema
 * )
 *
 * if (resp.status === 200) {
 *   console.log(resp.data.a) // a is inferred to be a number.
 * }
 * ```
 *
 * @param baseURL the base url of the backend to use.
 * @param loadAuthBearerToken a function that returns the loaded JWT.
 * @returns a function to make an API call.
 */
export const tifAPITransport = (baseURL: URL, middleware: TiFAPIMiddleware) => {
  return async <
    Method extends TiFHTTPMethod,
    Schemas extends TiFAPIResponseSchemas
  >(
    request: TiFAPIRequest<Method>,
    responseSchemas: Schemas,
    signal?: AbortSignal
  ): Promise<TiFAPIResponse<Schemas>> => {
    try {
      const resp = await performRequest(request, middleware, baseURL, signal)
      const json = await tryResponseBody(resp)
      const schema = tryResponseSchema(resp.status, responseSchemas, json)
      return {
        status: resp.status,
        data: await tryParseBody(json, resp.status, schema)
      } as TiFAPIResponse<Schemas>
    } catch (error) {
      if (!(error instanceof DOMException) || error.name !== "AbortError") {
        log.error("Failed to make tif API request.", {
          error,
          errorMessage: error.message
        })
      }
      throw error
    }
  }
}

/**
 * A type defining a function that can perform fetches to the TiFAPi.
 */
export type TiFAPITransport = ReturnType<typeof tifAPITransport>

const performRequest = async (
  request: TiFAPIRequest<TiFHTTPMethod>,
  middleware: TiFAPIMiddleware,
  baseURL: URL,
  signal?: AbortSignal
) => {
  const searchParams = queryToSearchParams(request.query ?? {})
  const url = `${baseURL}${request.endpoint.slice(1)}?${searchParams}`
  return await middleware(
    {
      method: request.method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request.body),
      signal
    },
    (request) => fetch(url, request)
  )
}

const tryResponseSchema = (
  status: number,
  schemas: TiFAPIResponseSchemas,
  json: unknown
) => {
  const statusKey = `status${status}` as keyof StatusCodeMap
  const schema = schemas[statusKey]
  if (!schema) {
    throw new Error(
      `TiF API responded with an unexpected status code ${status} and body ${JSON.stringify(json)}`
    )
  }
  return schema
}

const tryParseBody = async (
  json: unknown,
  status: number,
  responseSchema: ZodSchema | "no-content"
) => {
  if (responseSchema === "no-content" && json !== FETCH_RESPONSE_EMPTY_BODY) {
    throw new Error(
      `TiFAPI responded with a 204 status code and body ${JSON.stringify(json)}. A 204 status code should not produce a body.`
    )
  } else if (responseSchema === "no-content") {
    return {}
  } else {
    try {
      return await responseSchema.parseAsync(json)
    } catch {
      throw new Error(
        `TiF API responded with an invalid JSON body ${JSON.stringify(
          json
        )} and status ${status}.`
      )
    }
  }
}

const tryResponseBody = async (resp: Response) => {
  try {
    return await resp.json()
  } catch {
    if (resp.status !== 204) {
      throw new Error(
        `TiF API responded with non-JSON body and status ${resp.status}.`
      )
    }
    return FETCH_RESPONSE_EMPTY_BODY
  }
}

const queryToSearchParams = (query: TiFAPIRequestQueryParameters) => {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (!value) continue
    params.set(key, value.toString())
  }
  return params
}
