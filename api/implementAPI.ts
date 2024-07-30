import { chainMiddleware, runMiddleware } from "../lib/Middleware";
import { tryParseAPICall } from "./APIValidation";
import { APIHandler, APIMiddleware, APISchema, EndpointSchemasToFunctions, GenericEndpointSchema, InputSchema } from "./TransportTypes";

export type APIHandlerCollector = (endpointName: string, endpointSchema: GenericEndpointSchema, __: APIMiddleware) => void

export const implementAPI = <T extends APISchema, InputExtension extends InputSchema>(
  endpointSchemas: T,
  apiMiddleware?: APIMiddleware,
  handlerCollector?: APIHandlerCollector
) =>
  Object.keys(endpointSchemas).reduce((api, key) => {
    const schema = endpointSchemas[key] as GenericEndpointSchema

    let middleware: APIMiddleware = tryParseAPICall;

    if (apiMiddleware) {
      middleware = chainMiddleware(middleware, apiMiddleware);
    }
    
    const apiHandler = runMiddleware(middleware)
    
    handlerCollector?.(key, schema, apiHandler)

    api[key as keyof T] = (input) => apiHandler({endpointName: key, endpointSchema: schema, input});

    return api;
  }, {} as Record<keyof T, APIHandler>) as EndpointSchemasToFunctions<T, InputExtension>;  