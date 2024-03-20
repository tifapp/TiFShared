import { DistanceUnit, metersToMiles } from "../lib/MetricConversions"
import { z } from "zod"

/**
 * A zod schema for {@link LocationCoordinate2D}.
 */
export const LocationCoordinate2DSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
})

/**
 * A simple latitude and longitude based coordinate.
 */
export type LocationCoordinate2D = z.rInfer<typeof LocationCoordinate2DSchema>

/**
 * Returns true if 2 {@link LocationCoordinate2D}s are equal.
 */
export const areCoordinatesEqual = (
  a: LocationCoordinate2D,
  b: LocationCoordinate2D
) => {
  return a.latitude === b.latitude && a.longitude === b.longitude
}

const EARTH_RADIUS_METERS = 6371e3

const DISTANCE_CONVERSION_TABLE = {
  miles: metersToMiles,
  meters: (meters: number) => meters
}

/**
 * Computes the number of meters between 2 {@link LocationCoordinate2D} using
 * the haversine formula.
 *
 * For more info on the math: https://en.wikipedia.org/wiki/Haversine_formula
 *
 * @param c1 The first coordinate.
 * @param c2 The second coordinate.
 * @param unit The unit of distance to use in the calculation.
 */
export const coordinateDistance = (
  c1: LocationCoordinate2D,
  c2: LocationCoordinate2D,
  unit: DistanceUnit
) => {
  const lat1Radians = Math.degreesToRadians(c1.latitude)
  const lat2Radians = Math.degreesToRadians(c2.latitude)

  const latDeltaRadians = Math.degreesToRadians(c2.latitude - c1.latitude)
  const lngDeltaRadians = Math.degreesToRadians(c2.longitude - c1.longitude)

  const latDelta = Math.sin2(latDeltaRadians / 2)
  const latCos = Math.cos(lat1Radians) * Math.cos(lat2Radians)
  const lngDelta = Math.sin2(lngDeltaRadians / 2)

  return DISTANCE_CONVERSION_TABLE[unit](
    2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(latDelta + latCos * lngDelta))
  )
}
