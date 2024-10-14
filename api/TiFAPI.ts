import { logger } from "../logging"
import { TiFAPIClientCreator } from "./APIClient"
import { APIValidationError, validateAPICall } from "./APIValidation"
import { TiFAPIClient } from "./TiFAPISchema"
import { ClientExtensions, tifAPITransport } from "./Transport"
import { jwtMiddleware } from "./TransportMiddleware"

export const TEST_API_URL = new URL("http://localhost:8080")

const log = logger("tif.apiClient.validation")

export const validateAPIClientCall = validateAPICall<ClientExtensions>(result => {
  if (result.validationStatus === "passed") {
    return result.response
  } else if (result.validationStatus === "invalid-request") {
    log.error(`Request to TiF API endpoint ${result.requestContext.endpointName} is not valid`, result.requestContext)
  } else if (result.validationStatus === "unexpected-response") {
    log.error(`TiF API endpoint ${result.requestContext.endpointName} responded unexpectedly`, result.response)
  } else if (result.validationStatus === "invalid-response") {
    log.error(`Response from TiF API endpoint ${result.requestContext.endpointName} does not match the expected schema`, result.response)
  }
  
  throw new APIValidationError(result.validationStatus)
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
