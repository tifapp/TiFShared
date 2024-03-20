export type DistanceUnit = "miles" | "meters"

export const milesToMeters = (miles: number) => miles * METERS_PER_MILE
export const milesToFeet = (miles: number) => miles * FEET_PER_MILE
export const metersToMiles = (meters: number) => meters / METERS_PER_MILE

const METERS_PER_MILE = 1609.344
const FEET_PER_MILE = 5280
