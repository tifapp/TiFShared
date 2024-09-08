import { middlewareRunner } from "lib/Middleware";
import { tryParseAPICall } from "./APIValidation";
import { TiFAPIClient, implementTiFAPI } from "./TiFAPISchema";
import { tifAPITransport } from "./Transport";
import { jwtMiddleware } from "./TransportMiddleware";

export const TEST_API_URL = new URL("http://localhost:8080")
export class TiFAPI {
  /**
   * An instance of {@link TiFAPIClient} for unit testing.
   */
  static testAuthenticatedInstance = 
    implementTiFAPI(
      () => 
        middlewareRunner(
          tryParseAPICall,
          tifAPITransport(
            TEST_API_URL,
            jwtMiddleware(
              async () => "I was here at the beginning, and I will proclaim the end."
            )
          )
        )
    )

  /**
   * An instance of {@link TiFAPIClient} for unit testing.
   */
  static testUnauthenticatedInstance = 
    implementTiFAPI(
      () => 
        middlewareRunner(
          tryParseAPICall,
          tifAPITransport(
            TEST_API_URL,
            async (request, next) => next(request)
          )
        )
    )
}
