import { ZodType, z } from "zod";
import { Handler, Middleware } from "../lib/Middleware";
import { JSONSerializableValue, NonEmptyPartial } from "../lib/Types/HelperTypes";
import { StrictExtends } from "../lib/Types/StrictExtendsType";
import { URLEndpoint, URLParameters } from "../lib/URL";

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

export type StatusCodes = StatusCodeMap[keyof StatusCodeMap]

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

export type TiFAPIResponse<Schemas extends APIResponseSchemas> = {
  [key in keyof StatusCodeMap]: Schemas[key] extends APINoContentSchema
    ? {
      status: 204,
      data?: undefined
    }
    : SchemaFor<key, Schemas> extends ZodType ? {
        status: StatusCodeMap[key]
        data: z.infer<SchemaFor<key, Schemas>>
      }
    : never
}[keyof StatusCodeMap]

type TiFAPIInput = {
  body?: APIRequestBody;
  query?: URLParameters;
  params?: URLParameters;
};

export type TiFAPIInputContext<T> = {
  endpointName: string;
  endpointSchema: GenericEndpointSchema;
} & T & TiFAPIInput;

export type GenericEndpointSchema = {
  input: InputSchema;
  outputs: APIResponseSchemas;
  constraints?: (input: any, output: any) => boolean;
  httpRequest: HttpRequest<HTTPMethod>;
}

/**
 * Generic API endpoint middleware
 */
export type APIMiddleware<T = {}> = Middleware<TiFAPIInputContext<T>, TiFAPIResponse<any>>

/**
 * Generic API endpoint function
 */
export type APIHandler<T = {}> = Handler<TiFAPIInputContext<T>, TiFAPIResponse<any>>;

/**
 * Type asserts an endpoint schema.
 */
export const assertEndpointSchemaType = <
  TInput extends InputSchema,
  TOutput extends APIResponseSchemas,
  StrictInput extends StrictExtends<InputSchema, TInput>,
  StrictOutput extends StrictExtends<APIResponseSchemas, TOutput>
>(
  endpoint: EndpointSchema<StrictInput, StrictOutput>
) => endpoint

/**
 * Map of endpoint schemas.
 */
export type APISchema = Record<string, Omit<GenericEndpointSchema, "endpointName">>

/**
 * Transforms a map of endpoint schemas to a map of functions where the inputs and outputs are inferred from the endpoint schemas.
 */
export type EndpointSchemasToFunctions<TSchema extends APISchema, InputExtension = {}> = 
  { [K in keyof TSchema]: (_: OptionalInput<InputExtension & ZodInferredInput<TSchema[K]['input']>>) => Promise<TiFAPIResponse<TSchema[K]['outputs']>> }

export type InputSchema = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
};

type OptionalInput<T> = {} extends T ? void : T

type ZodInferredInput<T extends InputSchema> = {
  [K in keyof T]: T[K] extends ZodType ? z.rInfer<T[K]> : T[K];
};

type HttpRequest<T extends HTTPMethod> = { method: T; endpoint: URLEndpoint; }

type EndpointSchema<TInput extends InputSchema, TOutput extends APIResponseSchemas> = {
  input: TInput;
  outputs: TOutput;
  constraints?: (input: OptionalInput<ZodInferredInput<TInput>>, output: TiFAPIResponse<TOutput>) => boolean;
  httpRequest: "body" extends keyof TInput ? HttpRequest<Exclude<HTTPMethod, "GET">> : HttpRequest<HTTPMethod>;
}