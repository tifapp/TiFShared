import { pollyfillArray, repeatElements } from "./Array"

describe("TiFArray tests", () => {
  describe("ArrayExtensions tests", () => {
    test("compact map, basic", () => {
      const results = {
        hello: 1,
        world: undefined,
        again: 2,
        three: null
      }
      const arr = ["hello", "world", "again", "three"].ext
      const mapped = arr.compactMap((e: keyof typeof results) => results[e])
      expect(mapped).toEqual([1, 2])
    })

    test("compact map, full", () => {
      const arr = ["hello", "world", "again", "three"].ext
      const mapped = arr.compactMap((e, i, array) => {
        return array[i - 2] ?? e
      })
      expect(mapped).toEqual(["hello", "world", "hello", "world"])
    })

    test("random element, basic", () => {
      let randomReturnValue = 0.2521897349382
      const rand = () => randomReturnValue
      const array = [true, 2, {}, "hello"].ext
      expect(array.randomElement(rand)).toEqual(2)

      randomReturnValue = 0.19798739
      expect(array.randomElement(rand)).toEqual(true)

      randomReturnValue = 0.687687363
      expect(array.randomElement(rand)).toEqual({})

      randomReturnValue = 0.92908309
      expect(array.randomElement(rand)).toEqual("hello")
    })

    test("random element, empty", () => {
      expect([].ext.randomElement()).toBeUndefined()
    })

    test("various transforms", () => {
      const arr = ["hello", "worlds", "h"].ext
        .compactMap((e) => e.length)
        .map((e) => e * 2)
        .ext.sort()
        .filter((e) => e > 2)
        .ext.compactMap((e) => (e > 10 ? undefined : e / 2))
      expect(arr).toEqual([5])
    })

    test("repeat elements, basic", () => {
      const array = repeatElements(5, 1)
      expect(array).toEqual([1, 1, 1, 1, 1])
    })

    test("repeat elements, based on index", () => {
      const array = repeatElements(5, (i) => i)
      expect(array).toEqual([0, 1, 2, 3, 4])
    })
  })

  describe("ArrayWithPollyfill tests", () => {
    const actualWith = Array.prototype.with
    beforeAll(() => {
      const a = Array.prototype as any
      a.with = undefined
      pollyfillArray()
    })
    afterAll(() => {
      Array.prototype.with = actualWith
    })

    it("should throw a RangeError when index is out of bounds", () => {
      expect(() => ([] as string[]).with(-1, "hello")).toThrowError(
        new RangeError("Invalid index : -1")
      )
      expect(() => ([] as string[]).with(1, "hello")).toThrowError(
        new RangeError("Invalid index : 1")
      )
    })

    it("should create a copy of the array", () => {
      const arr = ["apple", "orange"]
      const arr2 = arr.with(0, "grape")
      expect(arr === arr2).toEqual(false)
    })

    it("should update the proper element at the specified index", () => {
      const arr = ["apple", "orange", "celery"]
      expect(arr.with(1, "grape")).toEqual(["apple", "grape", "celery"])
    })
  })
})
