import { TiFAPIClient, implementTiFAPI } from "./TiFAPISchema";
import { tifAPITransport } from "./Transport";
import { jwtMiddleware } from "./TransportMiddleware";
import { MockAPIImplementation, mswBuilder } from "./mockAPIServer";

export const TEST_API_URL = new URL("http://localhost:8080")

export class TiFAPI {
  /**
   * An instance of {@link TiFAPIClient} for unit testing.
   */
  static testAuthenticatedInstance = implementTiFAPI(
    tifAPITransport(
      TEST_API_URL,
      jwtMiddleware(
        async () => "I was here at the beginning, and I will proclaim the end."
      )
    )
  )

  /**
   * An instance of {@link TiFAPIClient} for unit testing.
   */
  static testUnauthenticatedInstance = implementTiFAPI(
    tifAPITransport(
      TEST_API_URL,
      async (request, next) => next(request)
    )
  )
  
  /**
   * Mocks an api server for unit testing.
   */
  static mockServer = (
    endpointMocks: Partial<{
      [EndpointName in keyof TiFAPIClient]: MockAPIImplementation<TiFAPIClient[EndpointName]>
    }>
  ) =>
    implementTiFAPI(
      undefined,
      undefined,
      (endpointName, { httpRequest: { method, endpoint }}) => mswBuilder(TEST_API_URL, method, endpoint, endpointMocks[endpointName as keyof TiFAPIClient] as any)
    );
}
