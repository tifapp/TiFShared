import { _extendArray } from "./Array"

/**
 * Returns the same reference to the given value with extended super powers.
 *
 * Supported types:
 * - Arrays
 *
 * Ex.
 * ```ts
 * const baseArr = [1, 2, 3]
 * const arr = ext(baseArr) // arr now has a compactMap method and much more...
 * console.log(arr === baseArr) // Logs true, same reference.
 * ```
 */
export function ext<T>(value: T[]) {
  return _extendArray(value)
}
