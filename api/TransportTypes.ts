import { ZodType, z } from "zod";
import { Handler, Middleware } from "../lib/Middleware";
import { JSONSerializableValue, NonEmptyPartial } from "../lib/Types/HelperTypes";
import { StrictExtends } from "../lib/Types/StrictExtendsType";
import { URLEndpoint, URLParameters } from "../lib/URL";

export type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

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

export type APIResponseSchemas = NonEmptyPartial<{
  [key in keyof StatusCodeMap]: key extends "status204"
    ? "no-content"
    : ZodType
}>

export type AnyTiFAPIResponse = TiFAPIResponse<any>

type TiFAPIResponse<Schemas extends APIResponseSchemas> = {
  [key in keyof Schemas]: key extends "status204"
    ? {
      status: 204,
      data?: undefined
    }
    : Schemas[key] extends ZodType ? {
        status: StatusCodeMap[key & keyof StatusCodeMap]
        data: z.infer<Schemas[key]>
      }
    : never
}[keyof Schemas]

type TiFAPIInput = {
  body?: { [key: string]: JSONSerializableValue };
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
export type APIMiddleware<T = {}> = Middleware<TiFAPIInputContext<T>, AnyTiFAPIResponse>

/**
 * Generic API endpoint function
 */
export type APIHandler<T = {}> = Handler<TiFAPIInputContext<T>, AnyTiFAPIResponse>;

/**
 * Type asserts an endpoint schema.
 */
export const endpointSchema = <
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

type ZodInferredInput<T extends InputSchema> = {
  [K in keyof T as T[K] extends z.ZodOptional<any> ? never : K]: 
    T[K] extends ZodType ? z.rInfer<T[K]> : T[K];
} & {
  [K in keyof T as T[K] extends z.ZodOptional<any> ? K : never]?: 
    T[K] extends z.ZodOptional<any> ? z.rInfer<T[K]> : T[K];
};

type OptionalInput<T> = {} extends T ? void : T

type HttpRequest<T extends HTTPMethod> = { method: T; endpoint: URLEndpoint; }

type EndpointSchema<TInput extends InputSchema, TOutput extends APIResponseSchemas> = {
  input: TInput;
  outputs: TOutput;
  constraints?: (input: OptionalInput<ZodInferredInput<TInput>>, output: TiFAPIResponse<TOutput>) => boolean;
  httpRequest: "body" extends keyof TInput ? HttpRequest<Exclude<HTTPMethod, "GET">> : HttpRequest<HTTPMethod>;
}