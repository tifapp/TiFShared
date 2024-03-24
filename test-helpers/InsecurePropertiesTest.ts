import {
  INSECURE_OBJECT_PROPERTY_NAMES,
  InsecureObjectPropertyError,
  InsecureObjectPropertyName
} from "../lib/InsecureProperties"

export const insecurePropertiesTest = (
  perform: (propertyName: InsecureObjectPropertyName) => any
) => {
  INSECURE_OBJECT_PROPERTY_NAMES.forEach((name) => {
    expect(() => perform(name)).toThrow(InsecureObjectPropertyError)
  })
}
