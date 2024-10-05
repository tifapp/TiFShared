import { HttpResponse, http } from "msw";
import { TEST_API_URL, TiFAPI, TiFAPIClient, TiFAPISchema } from "../api";
import { APIHandler, APISchema, EndpointSchemasToFunctions, GenericEndpointSchema, StatusCodes } from "../api/TransportTypes";
import { queryFromSearchParams } from "../lib/URL";
import { mswServer } from "./MSW";

const mswBuilder = (testUrl: URL, endpointName: string, endpointSchema: GenericEndpointSchema, {expectedRequest, handler, mockResponse}: MockAPIImplementation<APIHandler>) => {
  const {httpRequest: {method, endpoint}} = endpointSchema

  mswServer.use(
    http[method.toLowerCase() as Lowercase<typeof method>](`${testUrl}${endpoint.slice(1)}`, async ({ request, params }) => {
      let body: any
      if (method === "GET") {
        body = undefined
      } else {
        try {
          body = await request.json();
        } catch {
          body = undefined;
        }
      }

      const input = {body, params, query: queryFromSearchParams(new URL(request.url))}
    
      if (expectedRequest) {
        expect(input).toMatchObject(expectedRequest)
      }

      handler?.({...input, endpointName, endpointSchema})

      const {data, status} = mockResponse

      return HttpResponse.json(data, { status })
    })
  );
}

export type MockAPIImplementation<Fn extends (...args: any) => any> = {
  expectedRequest?: Parameters<Fn>[0],
  handler?: (args: Parameters<Fn>[0]) => void,
  mockResponse: Awaited<ReturnType<Fn>>,
}

export const mockAPIServer = <T extends APISchema>(
  testUrl: URL,
  endpointSchema: T,
  endpointMocks: Partial<{
    [EndpointName in keyof EndpointSchemasToFunctions<T>]: MockAPIImplementation<EndpointSchemasToFunctions<T>[EndpointName]>
  }>
) => 
  Object.entries(endpointMocks).forEach(([endpointName, endpointMock]) =>
    mswBuilder(testUrl, endpointName, endpointSchema[endpointName], endpointMock)
  )

export const mockTiFServer = (
  endpointMocks: Partial<{
    [EndpointName in keyof TiFAPIClient]: MockAPIImplementation<TiFAPIClient[EndpointName]>
  }>
) =>
  mockAPIServer(TEST_API_URL, TiFAPISchema, endpointMocks)

type APIResponse<T, U extends StatusCodes> = T extends { status: U } ? T : never;

export const mockTiFEndpoint = <EndpointName extends keyof TiFAPIClient, Status extends StatusCodes>(endpointName: EndpointName, status: Status, data?: APIResponse<Awaited<ReturnType<TiFAPI[EndpointName]>>, Status>["data"]) =>
  mockAPIServer(TEST_API_URL, TiFAPISchema, {[endpointName]: {mockResponse: ({status, data})}} as any) // NB: typescript not inferring key name properly