export const INSECURE_OBJECT_PROPERTY_NAMES = [
  "__proto__",
  "constructor",
  "prototype"
] as const

export type InsecureObjectPropertyName =
  (typeof INSECURE_OBJECT_PROPERTY_NAMES)[number]

export class InsecureObjectPropertyError extends Error {
  constructor(name: string) {
    super(`${name} is an insecure property name due to prototype pollution.`)
  }
}

/**
 * Throws an error if the given object contains an enumerable property that is
 * insecure.
 */
export const throwIfContainsInsecurePropertyName = (object: object) => {
  INSECURE_OBJECT_PROPERTY_NAMES.forEach((name) => {
    if (Object.getOwnPropertyNames(object).includes(name)) {
      throw new InsecureObjectPropertyError(name)
    }
  })
}

/**
 * Removes any insecure property names from the given object.
 */
export const removeInsecureProperties = <Obj extends object>(
  object: Obj
): Omit<Obj, InsecureObjectPropertyName> => {
  return Object.fromEntries(
    Object.entries(object).filter(([k, _]) => {
      return !INSECURE_OBJECT_PROPERTY_NAMES.includes(
        k as InsecureObjectPropertyName
      )
    })
  ) as Obj
}
