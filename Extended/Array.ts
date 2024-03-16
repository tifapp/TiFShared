/**
 * An interface that adds some extra methods to an array.
 */
export interface ExtendedArray<Element> extends Array<Element> {
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

/**
 * Do not call this, use {@link ext} instead.
 *
 * @internal
 */
export const _extendArray = <Element,>(
  array: Element[]
): ExtendedArray<Element> => {
  Object.defineProperty(array, "compactMap", {
    value: compactMap.bind(undefined, array)
  })
  Object.defineProperty(array, "randomElement", {
    value: randomElement.bind(undefined, array)
  })
  return array as unknown as ExtendedArray<Element>
}

const compactMap = <A, B>(
  array: A[],
  mapper: (element: A, index: number, array: A[]) => B | null | undefined
) => {
  const mappedArray = [] as NonNullable<B>[]
  for (let i = 0; i < array.length; i++) {
    const mapped = mapper(array[i], i, array)
    if (mapped) mappedArray.push(mapped)
  }
  return _extendArray(mappedArray)
}

const randomElement = <A,>(
  array: A[],
  randomValue: () => number = Math.random
) => {
  return array[Math.floor(array.length * randomValue())]
}
