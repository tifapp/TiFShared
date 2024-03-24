import { AnyClass, OmitFirstArgument } from "./HelperTypes"
import { throwIfContainsInsecurePropertyName } from "./InsecureProperties"

export type Extension<
  Type,
  Extensions extends Record<string, (instance: Type, ...args: any) => any>
> = Type & {
  [key in keyof Extensions]: OmitFirstArgument<Extensions[key]>
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
  throwIfContainsInsecurePropertyName(extensions)
  return _extension(value, extensions, Object.getOwnPropertyNames(value))
}

const _extension = <
  Value extends object,
  Extensions extends Record<string, (instance: Value, ...args: any) => any>
>(
  value: Value,
  extensions: Extensions,
  preexistsingProperties: string[]
) => {
  Object.keys(extensions).forEach((extensionProperty) => {
    if (preexistsingProperties.includes(extensionProperty)) {
      throw new ExtendedPropertyExistsError(extensionProperty)
    }
    Object.defineProperty(value, extensionProperty, {
      writable: true,
      value: extensions[extensionProperty].bind(undefined, value)
    })
  })
  return value as Extension<Value, Extensions>
}

export class UnableToExtendPrototypeError extends Error {
  constructor(clazz: AnyClass) {
    super(
      `Cannot extend prototype on ${clazz.name} since it already contains an ext property.`
    )
  }
}

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
  if (!canExtendPrototype(clazz)) {
    throw new UnableToExtendPrototypeError(clazz)
  }
  const allExtensions = protoStorage.tryToStore(clazz, extensions)
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

const canExtendPrototype = (clazz: AnyClass) => {
  return !("ext" in clazz.prototype) || protoStorage.hasExtended(clazz)
}

type AnyExtensionFunction = (instance: any, ...args: any) => any

class PrototypeExtensionsStorage {
  private map = new Map<string, Record<string, AnyExtensionFunction>>()

  hasExtended(clazz: AnyClass) {
    return !!this.map.get(clazz.name)
  }

  tryToStore(
    clazz: AnyClass,
    extensions: Record<string, AnyExtensionFunction>
  ) {
    throwIfContainsInsecurePropertyName(extensions)
    const clazzProperties = this.allPropertiesOf(clazz)
    Object.keys(extensions).forEach((extensionProperty) => {
      if (clazzProperties.includes(extensionProperty)) {
        throw new ExtendedPropertyExistsError(extensionProperty, clazz)
      }
    })
    const allExtensions = { ...this.map.get(clazz.name), ...extensions }
    this.map.set(clazz.name, allExtensions)
    return allExtensions
  }

  private allPropertiesOf(clazz: AnyClass) {
    return Object.keys(this.map.get(clazz.name) ?? {}).concat(
      Object.getOwnPropertyNames(clazz.prototype)
    )
  }
}

const protoStorage = new PrototypeExtensionsStorage()
