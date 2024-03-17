import { AnyClass, OmitFirstArgument } from "./HelperTypes"

/**
 * Returns a function to extend an existing class type with the supplied
 * functions from the given object. The returned function does not edit
 * the prototype of the class, but rather adds the extension methods to the
 * given object itself.
 *
 * Ex.
 * ```ts
 * class Thing {
 *   prop = 1
 * }
 *
 * const ext = extension(Thing, { double: (thing) => thing.prop * 2 })
 * const value = ext(new Thing()).double() // value === 2
 * ```
 *
 * This is particularly useful for extending builtin classes.
 *
 * Ex.
 * ```ts
 * const ext = extension(Date, {
 *   unixTimestamp: (date) => date.getTime() / 1000
 * })
 * const unixTimestamp = ext(new Date()).unixTimestamp()
 * ```
 */
export const extension = <
  Class extends AnyClass,
  Extensions extends Record<
    string,
    (instance: InstanceType<Class>, ...args: any) => any
  >
>(
  _: Class,
  extensions: Extensions
) => {
  return (
    instance: InstanceType<Class>
  ): InstanceType<Class> & {
    [key in keyof Extensions]: OmitFirstArgument<Extensions[key]>
  } => {
    Object.keys(extensions).forEach((name) => {
      Object.defineProperty(instance, name, {
        writable: true,
        value: extensions[name].bind(undefined, instance)
      })
    })
    return instance
  }
}
