import { Extension, protoypeExtension } from "./Extend"

type BaseFunctions<Element> = Omit<
  ReturnType<typeof extensions<Element>>,
  "compactMap"
>

export interface ExtendedArray<T>
  extends Extension<Array<T>, BaseFunctions<T>> {
  /**
   * Maps the values in the array based on the given function, but removes
   * any null or undefined values from the resulting array.
   *
   * Ex.
   * ```ts
   * const arr = ["hello", "world", "hh"].ext
   *   .compactMap((e) => e.startsWith("h") ? e.length : undefined)
   * console.log(arr) // Logs "[5, 2]", and omits the length of "world" since it does not start with "h"
   * ```
   *
   * @param mapper A function to map an element from this array to an element in the new array.
   */
  compactMap<B>(
    mapper: (element: T, index: number, array: T[]) => B | null | undefined
  ): ExtendedArray<B>
}

declare global {
  interface Array<T> {
    get ext(): ExtendedArray<T>
  }
}

const extensions = <T,>() => ({
  compactMap: <B,>(
    array: T[],
    mapper: (element: T, index: number, array: T[]) => B | null | undefined
  ) => {
    const mappedArray = [] as NonNullable<B>[]
    for (let i = 0; i < array.length; i++) {
      const mapped = mapper(array[i], i, array)
      if (mapped) mappedArray.push(mapped)
    }
    return mappedArray.ext
  },
  /**
   * Computes a random element from this array and returns the result.
   *
   * @param randomValue See {@link Math.random}.
   */
  randomElement: (array: T[], randomValue: () => number = Math.random) => {
    return array[Math.floor(array.length * randomValue())]
  }
})

protoypeExtension(Array, extensions())

/**
 * Returns an {@link ExtendedArray} of the given element repeated `times`.
 *
 * @param times The number of times to repeat `element`.
 * @param element The repeated value, or function to compute the repeated value.
 */
export const repeatElements = <T,>(
  times: number,
  element: T | ((index: number) => T)
) => {
  return (Array.apply(null, Array(times)) as null[]).map((_, index) => {
    if (element instanceof Function) {
      return element(index)
    }
    return element
  })
}
