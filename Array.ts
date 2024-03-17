import { ReplaceReturnType } from "./HelperTypes"
import { extension } from "./Extend"

type ArrayExtensions<Element> = Omit<
  Array<Element>,
  "map" | "sort" | "filter" | "slice" | "splice"
> & {
  map: ReplaceReturnType<Array<Element>["map"], ExtendedArray<Element>>
  filter: ReplaceReturnType<Array<Element>["filter"], ExtendedArray<Element>>
  slice: ReplaceReturnType<Array<Element>["slice"], ExtendedArray<Element>>
  sort: ReplaceReturnType<Array<Element>["sort"], ExtendedArray<Element>>
  splice: ReplaceReturnType<Array<Element>["splice"], ExtendedArray<Element>>
}

/**
 * An interface that adds some extra methods to an array.
 */
export interface ExtendedArray<Element> extends ArrayExtensions<Element> {
  /**
   * Maps the values in the array based on the given function, but removes
   * any null or undefined values from the resulting array.
   *
   * Ex.
   * ```ts
   * const arr = ext(["hello", "world", "hh"])
   *   .compactMap((e) => e.startsWith("h") ? e.length : undefined)
   * console.log(arr) // Logs "[5, 2]", and omits the length of "world" since it does not start with "h"
   * ```
   *
   * @param mapper A function to map an element from this array to an element in the new array.
   */
  compactMap<NewElement>(
    mapper: (
      element: Element,
      index: number,
      array: ExtendedArray<Element>
    ) => NewElement | undefined | null
  ): ExtendedArray<NonNullable<NewElement>>

  /**
   * Computes a random element from this array and returns the result.
   *
   * @param randomValue See {@link Math.random}.
   */
  randomElement(randomValue?: () => number): Element | undefined
}
const extendArrayFunction = <T,>(name: keyof T[]) => {
  return (array: T[], ...args: any) => {
    return ext(Array.prototype[name].call(array, ...args))
  }
}

/**
 * A function to extend an array into an {@link ExtendedArray}.
 */
export const ext = extension(Array, {
  compactMap: <A, B>(
    array: A[],
    mapper: (element: A, index: number, array: A[]) => B | null | undefined
  ) => {
    const mappedArray = [] as NonNullable<B>[]
    for (let i = 0; i < array.length; i++) {
      const mapped = mapper(array[i], i, array)
      if (mapped) mappedArray.push(mapped)
    }
    return ext(mappedArray)
  },
  randomElement: <A,>(array: A[], randomValue: () => number = Math.random) => {
    return array[Math.floor(array.length * randomValue())]
  },
  sort: extendArrayFunction("sort"),
  filter: extendArrayFunction("filter"),
  map: extendArrayFunction("map"),
  slice: extendArrayFunction("slice"),
  splice: extendArrayFunction("splice")
}) as <T>(array: T[] | ExtendedArray<T>) => ExtendedArray<T>

/**
 * Returns an {@link ExtendedArray} of the given element repeated `times`.
 *
 * @param times The number of times to repeat `element`.
 * @param element The repeated value, or function to compute the repeated value.
 */
export const repeatElements = <Element,>(
  times: number,
  element: Element | ((index: number) => Element)
) => {
  return ext(
    (Array.apply(null, Array(times)) as null[]).map((_, index) => {
      if (element instanceof Function) {
        return element(index)
      }
      return element
    })
  )
}
