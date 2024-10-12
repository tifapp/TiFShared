import { middlewareRunner } from "../lib/Middleware";
import { NonEmptyArray } from "../lib/Types/HelperTypes";
import { TiFAPIClient, TiFAPISchema } from "./TiFAPISchema";
import { APIMiddleware, APISchema, EndpointSchemasToFunctions, TiFAPIInputContext } from "./TransportTypes";

export const APIClientCreator = <InputExtension, Schema extends APISchema>(endpointSchema: Schema, ...apiMiddleware: NonEmptyArray<APIMiddleware<InputExtension>>) => 
  Object.entries(endpointSchema).reduce((apiClient, [endpointName, endpointSchema]) =>
    {
      // NB: EndpointSchemasToFunctions<> is read-only
      (apiClient[endpointName] as any) = ({ ...input } = {} as TiFAPIInputContext<any>) =>
        middlewareRunner(...apiMiddleware)({
          ...input,
          endpointName,
          endpointSchema
        } as TiFAPIInputContext<any>);

      return apiClient
    }
  , {} as EndpointSchemasToFunctions<Schema, InputExtension>)

export const TiFAPIClientCreator = <InputExtension>(...apiMiddleware: NonEmptyArray<APIMiddleware<InputExtension>>): TiFAPIClient<InputExtension> => 
  APIClientCreator(TiFAPISchema, ...apiMiddleware)
