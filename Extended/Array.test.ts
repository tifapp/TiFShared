import { ext } from "./Extend"

describe("TiFArray tests", () => {
  console.log(Array.prototype)

  test("compact map, basic", () => {
    const results = {
      hello: 1,
      world: undefined,
      again: 2,
      three: null
    }
    const arr = ext<keyof typeof results>(["hello", "world", "again", "three"])
    const mapped = arr.compactMap((e) => results[e])
    expect(mapped).toEqual([1, 2])
  })

  test("compact map, full", () => {
    const arr = ext(["hello", "world", "again", "three"])
    const mapped = arr.compactMap((e, i, array) => {
      return array[i - 2] ?? e
    })
    expect(mapped).toEqual(["hello", "world", "hello", "world"])
  })

  test("random element, basic", () => {
    let randomReturnValue = 0.2521897349382
    const rand = () => randomReturnValue
    const array = ext([true, 2, {}, "hello"])
    expect(array.randomElement(rand)).toEqual(2)

    randomReturnValue = 0.19798739
    expect(array.randomElement(rand)).toEqual(true)

    randomReturnValue = 0.687687363
    expect(array.randomElement(rand)).toEqual({})

    randomReturnValue = 0.92908309
    expect(array.randomElement(rand)).toEqual("hello")
  })

  test("random element, empty", () => {
    expect(ext([]).randomElement()).toBeUndefined()
  })

  test("various transforms", () => {
    const arr = ext(["hello", "worlds", "h"])
      .compactMap((e) => e.length)
      .map((e) => e * 2)
      .sort()
      .filter((e) => e > 2)
      .compactMap((e) => (e > 10 ? undefined : e / 2))
    expect(arr).toEqual([5])
  })
})
