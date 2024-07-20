import { HttpResponse, http } from "msw";
import { queryFromSearchParams } from "../lib/URL";
import { mswServer } from "../test-helpers/MSW";
import { APIHandler, APISchema, EndpointSchemasToFunctions, HTTPMethod } from "./TransportTypes";
import { implementAPI } from "./implementAPI";

export const mswBuilder = (testUrl: URL, method: HTTPMethod, endpoint: string, {expectedRequest, handler, mockResponse}: MockAPIImplementation<APIHandler>) => {
  mswServer.use(
    http[method.toLowerCase() as Lowercase<typeof method>](`${testUrl}${endpoint.slice(1)}`, async ({ request, params }) => {
      let body: any
      if (method === "GET") {
        body = undefined
      } else {
        body = await request.json()
      }

      const input = {body, params, query: queryFromSearchParams(new URL(request.url))}
    
      if (expectedRequest) {
        try {
          expect(input).toMatchObject(expectedRequest)
        } catch (e) {
          return HttpResponse.json({endpoint, expectedRequest, actualRequest: input}, {status: 500})
        }
      }

      handler?.(input)

      return HttpResponse.json(mockResponse.data, { status: mockResponse.status })
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
  endpointMocks: {
    [EndpointName in keyof EndpointSchemasToFunctions<T>]: MockAPIImplementation<EndpointSchemasToFunctions<T>[EndpointName]>
  }
) => 
  implementAPI(
    endpointSchema,
    undefined,
    undefined,
    (endpointName, { httpRequest: { method, endpoint }}) => mswBuilder(testUrl, method, endpoint, endpointMocks[endpointName as keyof EndpointSchemasToFunctions<T>] as any)
  )