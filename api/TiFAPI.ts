import { TiFAPIClientCreator } from "./APIClient"
import { validateAPICall } from "./APIValidation"
import { TiFAPIClient } from "./TiFAPISchema"
import { ClientExtensions, tifAPITransport } from "./Transport"
import { jwtMiddleware } from "./TransportMiddleware"

export const TEST_API_URL = new URL("http://localhost:8080")

export const validateAPIClientCall = validateAPICall(result => {
  if (result.validationStatus !== "passed") {
    throw new Error(result.validationStatus)
  }

  return result.response
})

type _StaticTiFAPI = typeof _TiFAPIClass
export interface TiFAPIConstructor extends _StaticTiFAPI {}

export interface TiFAPI extends InstanceType<TiFAPIConstructor>, TiFAPIClient<ClientExtensions> {}

class _TiFAPIClass {
  /**
   * An instance of {@link TiFAPIClient} for unit testing.
   */
  static testAuthenticatedInstance = TiFAPIClientCreator<ClientExtensions>(
    validateAPIClientCall,
    jwtMiddleware(
      async () => "I was here at the beginning, and I will proclaim the end."
    ),
    tifAPITransport(TEST_API_URL)
  )

  /**
   * An instance of {@link TiFAPIClient} for unit testing.
   */
  static testUnauthenticatedInstance = TiFAPIClientCreator<ClientExtensions>(
    validateAPIClientCall,
    tifAPITransport(TEST_API_URL)
  )
}

export const TiFAPI = _TiFAPIClass as TiFAPIConstructor
