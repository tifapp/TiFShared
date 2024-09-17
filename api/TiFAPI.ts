import { TiFAPIClientCreator } from "./APIClient";
import { validateAPICall } from "./APIValidation";
import { TiFAPIClient } from "./TiFAPISchema";
import { ClientExtensions, tifAPITransport } from "./Transport";
import { jwtMiddleware } from "./TransportMiddleware";

export const TEST_API_URL = new URL("http://localhost:8080")

const validateAPIClientCall = validateAPICall((status, value) => {
  if (status !== "passed") {
    throw new Error(status)
  }

  return value
})

export class TiFAPI {
  /**
   * An instance of {@link TiFAPIClient} for unit testing.
   */
  static testAuthenticatedInstance =
    TiFAPIClientCreator<ClientExtensions>(
      validateAPIClientCall,
      jwtMiddleware(async () => "I was here at the beginning, and I will proclaim the end."),
      tifAPITransport(TEST_API_URL)
    )

  /**
   * An instance of {@link TiFAPIClient} for unit testing.
   */
  static testUnauthenticatedInstance =
    TiFAPIClientCreator<ClientExtensions>(
      validateAPIClientCall,
      tifAPITransport(TEST_API_URL)
    )
}
