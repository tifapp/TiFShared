import { NonEmptyArray } from "lib/Types/HelperTypes";
import { MatchFnCollection } from "lib/Types/MatchType";
import { runMiddleware } from "../lib/Middleware";
import { tryParseAPICall } from "./APIValidation";
import { APIHandler, APIMiddleware, APISchema, EndpointSchemaToMiddleware, EndpointSchemasToFunctions, GenericEndpointSchema } from "./TransportTypes";

export type EndpointSchemaFunction = (_: {endpointName: string, endpointSchema: GenericEndpointSchema}) => void

export type APIImplementationCollector = (endpointName: string, endpointSchema: GenericEndpointSchema, __: APIHandler) => void

export const implementAPI = <T extends APISchema, Fns extends EndpointSchemasToFunctions<T>>(
  endpointSchemas: T,
  endpointSchemaToMiddleware?: EndpointSchemaToMiddleware, 
  implementations?: MatchFnCollection<EndpointSchemasToFunctions<T>, Fns>,
  implementationCollector?: APIImplementationCollector
) =>
  Object.keys(endpointSchemas).reduce((api, key) => {
    const schema = endpointSchemas[key] as GenericEndpointSchema

    let TiFAPIMiddleware: NonEmptyArray<APIMiddleware> = [tryParseAPICall(key, schema)];

    if (endpointSchemaToMiddleware) {
      TiFAPIMiddleware.push(endpointSchemaToMiddleware(key, schema));
    }

    if (implementations && implementations[key as keyof T]) {
      TiFAPIMiddleware.push(implementations[key as keyof T] as APIHandler);
    }
    
    const apiImplementation = runMiddleware(...TiFAPIMiddleware)
    
    implementationCollector?.(key, schema, apiImplementation)

    api[key as keyof T] = apiImplementation;

    return api;
  }, {} as Record<keyof T, any>) as EndpointSchemasToFunctions<any>;  