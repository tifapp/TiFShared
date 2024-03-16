import { ArrayUtils } from "./Array"

describe("ArrayUtils tests", () => {
  test("repeat elements, basic", () => {
    const array = ArrayUtils.repeatElements(5, 1)
    expect(array).toEqual([1, 1, 1, 1, 1])
  })

  test("repeat elements, based on index", () => {
    const array = ArrayUtils.repeatElements(5, (i) => i)
    expect(array).toEqual([0, 1, 2, 3, 4])
  })
})
