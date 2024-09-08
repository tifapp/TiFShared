import { TiFAPIClientCreator } from "./APIClient";
import { tryParseAPICall } from "./APIValidation";
import { TiFAPIClient } from "./TiFAPISchema";
import { Abortable, tifAPITransport } from "./Transport";
import { jwtMiddleware } from "./TransportMiddleware";

export const TEST_API_URL = new URL("http://localhost:8080")

export class TiFAPI {
  /**
   * An instance of {@link TiFAPIClient} for unit testing.
   */
  static testAuthenticatedInstance =
    TiFAPIClientCreator<Abortable>(
      tryParseAPICall,
      tifAPITransport(
        TEST_API_URL,
        jwtMiddleware(async () => "I was here at the beginning, and I will proclaim the end.")
      )
    )

  /**
   * An instance of {@link TiFAPIClient} for unit testing.
   */
  static testUnauthenticatedInstance =
    TiFAPIClientCreator<Abortable>(
      tryParseAPICall,
      tifAPITransport(
        TEST_API_URL,
        async (request, next) => next(request)
      )
    )
}
