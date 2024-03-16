import { ext } from "../Extended"

export namespace ArrayUtils {
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
}
