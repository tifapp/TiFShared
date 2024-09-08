import { APIHandler, APIMiddlewareHandler, APISchema, EndpointSchemasToFunctions, GenericEndpointSchema, InputSchema } from "./TransportTypes";

export type APIHandlerCreator = (_: GenericEndpointSchema) => APIMiddlewareHandler | void

/**
 * 
 * @param endpointSchemas API Schemas
 * @param handlerCreator Executes function for each route in the api 
 * @returns 
 */
export const implementAPI = <T extends APISchema, InputExtension extends InputSchema>(
  apiSchemas: T,
  handlerCreator: APIHandlerCreator
) =>
  Object.keys(apiSchemas).reduce((api, endpointName) => {
    const endpointSchema = {endpointName, ...apiSchemas[endpointName]}

    const apiHandler = handlerCreator(endpointSchema as GenericEndpointSchema)
    
    api[endpointName as keyof T] = async (input) => {
      if (!apiHandler) {
        throw new Error("Unimplemented Handler")
      }

      return apiHandler({endpointSchema, input})
    }

    return api;
  }, {} as Record<keyof T, APIHandler>) as EndpointSchemasToFunctions<T, InputExtension>;