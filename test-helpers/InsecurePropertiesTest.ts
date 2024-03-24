import {
  INSECURE_PROPERTY_NAMES,
  InsecurePropertyError
} from "../lib/InsecureProperties"

export const insecurePropertiesTest = (
  perform: (propertyName: string) => any
) => {
  INSECURE_PROPERTY_NAMES.forEach((name) => {
    expect(() => perform(name)).toThrow(InsecurePropertyError)
  })
}
