import { JSONSerializableValue, NonEmptyPartial } from "lib/Types/HelperTypes";
import { StrictExtends } from "lib/Types/StrictExtendsType";
import { URLEndpoint, URLParameters } from "lib/URL";
import { ZodType, ZodTypeAny, z } from "zod";
import { Handler, Middleware } from "../lib/Middleware";

export type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export type APIRequestBody = { [key: string]: JSONSerializableValue }

export type StatusCodeMap = {
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

type APINoContentSchema = "no-content"

type APIResponseSchemas = NonEmptyPartial<{
  [key in keyof StatusCodeMap]: key extends "status204"
    ? APINoContentSchema
    : ZodType
}>

const EmptyObjectSchema = z.object({})

type SchemaFor<
  Key extends keyof StatusCodeMap,
  Schemas extends APIResponseSchemas
> = Key extends "status204"
  ? Schemas[Key] extends APINoContentSchema
    ? typeof EmptyObjectSchema
    : undefined
  : Schemas[Key]

type TiFAPIResponse<Schemas extends APIResponseSchemas> = {
  [key in keyof StatusCodeMap]: SchemaFor<key, Schemas> extends ZodType
    ? {
        status: StatusCodeMap[key]
        data: z.infer<SchemaFor<key, Schemas>>
      }
    : never
}[keyof StatusCodeMap]

type TiFAPIInput = {
  body?: APIRequestBody;
  query?: URLParameters;
  params?: URLParameters;
  signal?: AbortSignal
} | void;

export type GenericEndpointSchema = EndpointSchema<any, any> | EndpointSchema<InputSchema | Omit<InputSchema, "body"> | {}, any>

/**
 * Generic API endpoint middleware
 */
export type APIMiddleware = Middleware<TiFAPIInput, TiFAPIResponse<any>>;

/**
 * Generic API endpoint function
 */
export type APIHandler = Handler<TiFAPIInput, TiFAPIResponse<any>>;

/**
 * Transforms endpoint schemas into middleware for API implementations.
 */
export type EndpointSchemaToMiddleware = (endpointName: string, endpointSchema: GenericEndpointSchema) => APIMiddleware;

/**
 * Type asserts an endpoint schema.
 */
export const assertEndpointSchemaType = <TInput extends InputSchema, TOutput extends APIResponseSchemas>(
  endpoint: EndpointSchema<
    StrictExtends<InputSchema, TInput>, 
    StrictExtends<APIResponseSchemas, TOutput>
  >
) => endpoint 

/**
 * Map of endpoint schemas.
 */
export type APISchema = Record<string, GenericEndpointSchema>

/**
 * Transforms a map of endpoint schemas to a map of functions where the inputs and outputs are inferred from the endpoint schemas.
 */
export type EndpointSchemasToFunctions<T extends APISchema> = { [K in keyof T]: (_: {} extends T[K]['input'] ? void : APIRequest<T[K]['input']> & {signal?: AbortSignal}) => Promise<TiFAPIResponse<T[K]['outputs']>>}

type InputSchema = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
};

type InferOrNever<T> = T extends ZodTypeAny ? z.infer<T> : never;

type APIRequest<T extends InputSchema> = keyof T extends never ? void : {
  [K in keyof T]: T[K] extends ZodTypeAny ? InferOrNever<T[K]> : undefined;
};

type HttpRequest<T extends HTTPMethod> = { method: T; endpoint: URLEndpoint; }

type EndpointSchema<TInput extends InputSchema, TOutput extends APIResponseSchemas> = {
  input: TInput;
  outputs: TOutput;
  constraints?: (input: APIRequest<TInput>, output: TiFAPIResponse<TOutput>) => boolean;
  httpRequest: "body" extends keyof TInput ? HttpRequest<Exclude<HTTPMethod, "GET">> : HttpRequest<HTTPMethod>;
}