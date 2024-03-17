import { AnyClass, OmitFirstArgument } from "./HelperTypes"

export type Extension<
  Type,
  Extensions extends Record<string, (instance: Type, ...args: any) => any>
> = Type & {
  [key in keyof Extensions]: OmitFirstArgument<Extensions[key]>
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
  Object.keys(extensions).forEach((name) => {
    Object.defineProperty(value, name, {
      writable: true,
      value: extensions[name].bind(undefined, value)
    })
  })
  return value as Extension<Value, Extensions>
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
  Object.defineProperty(clazz.prototype, "ext", {
    get() {
      return extension(this, extensions)
    }
  })
}
