import { ExtendedArray, _extendArray } from "./Array"

/**
 * Returns the extended form of the given type.
 */
export type Ext<Type> = Type extends (infer Element)[]
  ? ExtendedArray<Element>
  : Type

/**
 * Returns the same reference to the given value with extended super powers.
 *
 * Supported types:
 * - Arrays
 * - Strings
 *
 * Ex.
 * ```ts
 * const baseArr = [1, 2, 3]
 * const arr = ext(baseArr) // arr now has a compactMap method and much more...
 * console.log(arr === baseArr) // Logs true, same reference.
 * ```
 */
export function ext<T>(value: T[]): Ext<T> {
  return _extendArray(value) as Ext<T>
}
