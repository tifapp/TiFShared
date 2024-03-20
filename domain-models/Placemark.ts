import { z } from "zod"

/**
 * A zod schema for {@link Placemark}.
 */
export const PlacemarkSchema = z
  .object({
    name: z.string(),
    country: z.string(),
    postalCode: z.string(),
    street: z.string(),
    streetNumber: z.string(),
    region: z.string(),
    isoCountryCode: z.string(),
    city: z.string()
  })
  .partial()

/**
 * A type representing the components of an address.
 */
export type Placemark = z.rInfer<typeof PlacemarkSchema>
