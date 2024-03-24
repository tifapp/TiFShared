/**
 * Property names that shouldn't be defined on objects due to security
 * concerns.
 */
export const INSECURE_PROPERTY_NAMES = ["__proto__", "constructor", "prototype"]

export class InsecurePropertyError extends Error {
  constructor(name: string) {
    super(`${name} is an insecure property name due to prototype pollution.`)
  }
}

/**
 * Throws an error if the given object contains an enumerable property that is
 * insecure.
 */
export const throwIfContainsInsecurePropertyName = (object: object) => {
  INSECURE_PROPERTY_NAMES.forEach((name) => {
    if (Object.getOwnPropertyNames(object).includes(name)) {
      throw new InsecurePropertyError(name)
    }
  })
}
