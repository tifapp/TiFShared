import { LocationCoordinate2D } from "domain-models/LocationCoordinate2D"
import { Placemark } from "domain-models/Placemark"

/**
 * A type that maps a lat-lng coordinate to its respective placemark.
 */
export type NamedLocation = {
  coordinate: LocationCoordinate2D
  placemark: Placemark
}
