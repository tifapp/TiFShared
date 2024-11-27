
/**
 * Some mock Location coordinates suitable for testing.
 */
export namespace LocationCoordinatesMocks {
  export const SantaCruz = {
    latitude: 36.9741,
    longitude: -122.0308
  } as const

  export const NYC = {
    latitude: 40.7128,
    longitude: -74.006
  } as const

  export const SanFrancisco = {
    latitude: 37.7749,
    longitude: -122.4194
  } as const

  export const London = {
    latitude: 51.5072,
    longitude: 0.1276
  } as const

  export const Paris = {
    latitude: 48.8566,
    longitude: 2.3522
  } as const
}

export const baseTestPlacemark = {
  name: "Apple Infinite Loop",
  country: "United States of America",
  postalCode: "95104",
  street: "Cupertino Rd",
  streetNumber: "1234",
  region: "CA",
  isoCountryCode: "US",
  city: "Cupertino"
} as const

export const unknownLocationPlacemark = {
  name: "North Pacific Ocean"
} as const
