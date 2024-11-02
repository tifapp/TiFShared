import { logger } from "../logging"
import { TiFAPIClientCreator } from "./APIClient"
import { validateAPIClientCall } from "./APIValidation"
import { TiFAPIClient } from "./TiFAPISchema"
import { ClientExtensions, tifAPITransport } from "./Transport"
import { jwtMiddleware } from "./TransportMiddleware"

export const TEST_API_URL = new URL("http://localhost:8080")

const log = logger("tif.apiClient.validation")

export const validateTiFAPIClientCall = validateAPIClientCall("TiF", log)

type _StaticTiFAPI = typeof _TiFAPIClass
export interface TiFAPIConstructor extends _StaticTiFAPI {}

export interface TiFAPI
  extends InstanceType<TiFAPIConstructor>,
    TiFAPIClient<ClientExtensions> {}

class _TiFAPIClass {
  /**
   * An instance of {@link TiFAPIClient} for unit testing.
   */
  static testAuthenticatedInstance = TiFAPIClientCreator<ClientExtensions>(
    validateTiFAPIClientCall,
    jwtMiddleware(
      async () => "I was here at the beginning, and I will proclaim the end."
    ),
    tifAPITransport(TEST_API_URL)
  )

  /**
   * An instance of {@link TiFAPIClient} for unit testing.
   */
  static testUnauthenticatedInstance = TiFAPIClientCreator<ClientExtensions>(
    validateTiFAPIClientCall,
    tifAPITransport(TEST_API_URL)
  )
}

export const TiFAPI = _TiFAPIClass as TiFAPIConstructor
