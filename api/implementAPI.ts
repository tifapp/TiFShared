import { chainMiddleware, middlewareRunner } from "../lib/Middleware";
import { tryParseAPICall } from "./APIValidation";
import { APIHandler, APIMiddleware, APISchema, EndpointSchemasToFunctions, GenericEndpointSchema, InputSchema } from "./TransportTypes";

export type APIHandlerCollector = (endpointName: string, endpointSchema: GenericEndpointSchema, __: APIMiddleware) => void

/**
 * 
 * @param endpointSchemas API Schemas
 * @param apiMiddleware Function handler for api routes
 * @param handlerCollector Executes function for each route in the api 
 * @returns 
 */
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
    
    const apiHandler = middlewareRunner(middleware)
    
    handlerCollector?.(key, schema, apiHandler)

    api[key as keyof T] = (input) => apiHandler({endpointName: key, endpointSchema: schema, input});

    return api;
  }, {} as Record<keyof T, APIHandler>) as EndpointSchemasToFunctions<T, InputExtension>;  