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
    mapper: (element: Element) => NewElement | undefined | null
  ): ExtendedArray<NonNullable<NewElement>>

  /**
   * Computes a random element from this array and returns the result.
   *
   * @param randomValue See {@link Math.random}.
   */
  randomElement(randomValue?: () => number): Element | undefined
}

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
  return _extendArray(
    (Array.apply(null, Array(times)) as null[]).map((_, index) => {
      if (element instanceof Function) {
        return element(index)
      }
      return element
    })
  )
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
  mapper: (element: A) => B | null | undefined
) => {
  const mappedArray = [] as NonNullable<B>[]
  for (const element of array) {
    const mapped = mapper(element)
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
