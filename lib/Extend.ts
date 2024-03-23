import { AnyClass, OmitFirstArgument } from "./HelperTypes"

export type Extension<
  Type,
  Extensions extends Record<string, (instance: Type, ...args: any) => any>
> = Type & {
  [key in keyof Extensions]: OmitFirstArgument<Extensions[key]>
}

const INSECURE_NAMES = ["constructor", "prototype"]

export class InsecureExtensionError extends Error {
  constructor(name: string) {
    super(`${name} is an insecure extension name due to prototype pollution.`)
  }
}

export class ExtendedPropertyExistsError extends Error {
  constructor(propertyName: string, clazz?: AnyClass) {
    if (clazz) {
      super(`${clazz.name} already contains a property named ${propertyName}.`)
    } else {
      super(`${propertyName} already exists on object.`)
    }
  }
}

/**
 * Returns a function to extend an existing class type with the supplied
 * functions from the given object. The returned function does not edit
 * the prototype of the class, but rather adds the extension methods to the
 * given object itself.
 *
 * This is particularly useful for extending builtin classes.
 *
 * Ex.
 * ```ts
 * const ext = (date: Date) => {
 *   return extension(date, { unixTimestamp: (date) => date.getTime() / 1000 })
 * }
 * const unixTimestamp = ext(new Date()).unixTimestamp()
 * ```
 */
export const extension = <
  Value extends object,
  Extensions extends Record<string, (instance: Value, ...args: any) => any>
>(
  value: Value,
  extensions: Extensions
) => {
  return _extension(value, extensions, Object.getOwnPropertyNames(value))
}

const _extension = <
  Value extends object,
  Extensions extends Record<string, (instance: Value, ...args: any) => any>
>(
  value: Value,
  extensions: Extensions,
  preexistingNames: string[]
) => {
  Object.keys(extensions).forEach((name) => {
    if (INSECURE_NAMES.includes(name)) {
      throw new InsecureExtensionError(name)
    } else if (preexistingNames.includes(name)) {
      throw new ExtendedPropertyExistsError(name)
    }
    Object.defineProperty(value, name, {
      writable: true,
      value: extensions[name].bind(undefined, value)
    })
  })
  return value as Extension<Value, Extensions>
}

const table = new Map<
  string,
  Record<string, (instance: any, ...args: any) => any>
>()

/**
 * Applies an extension to the prototype of an object constructor to a property
 * called `"ext"`.
 *
 * This should only be used for very generic extensions, as it extends the
 * prototype of potentially native/built-in objects.
 *
 * Ex.
 * ```ts
 * class Thing {
 *   property = "hello"
 * }
 * prototypeExtension(Thing, { length: (t) => t.property.length })
 * const length = new Thing().ext.length()
 * ```
 */
export const protoypeExtension = <
  Class extends AnyClass,
  Extensions extends Record<
    string,
    (instance: InstanceType<Class>, ...args: any) => any
  >
>(
  clazz: Class,
  extensions: Extensions
) => {
  const properties = Object.keys(table.get(clazz.name) ?? {}).concat(
    Object.getOwnPropertyNames(clazz.prototype)
  )
  Object.keys(extensions).forEach((name) => {
    if (properties.includes(name)) {
      throw new ExtendedPropertyExistsError(name, clazz)
    } else if (INSECURE_NAMES.includes(name)) {
      throw new InsecureExtensionError(name)
    }
  })
  const allExtensions = { ...table.get(clazz.name), ...extensions }
  table.set(clazz.name, allExtensions)
  Object.defineProperty(clazz.prototype, "ext", {
    configurable: true,
    get() {
      return _extension(
        this,
        allExtensions,
        Object.getOwnPropertyNames(clazz.prototype)
      )
    }
  })
}
