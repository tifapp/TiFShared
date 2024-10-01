import { shallowEquals } from "./ShallowEquals"

describe("ShallowEquals tests", () => {
  test("should return true for same reference", () => {
    const obj = { a: 1 }
    expect(shallowEquals(obj, obj)).toBe(true)
  })

  test("should return false when one is null", () => {
    expect(shallowEquals(null, {})).toBe(false)
    expect(shallowEquals({}, null)).toBe(false)
  })

  test("should return false when one is undefined", () => {
    expect(shallowEquals(undefined, {})).toBe(false)
    expect(shallowEquals({}, undefined)).toBe(false)
  })

  test("should return true for two empty objects", () => {
    expect(shallowEquals({}, {})).toBe(true)
  })

  test("should return true for objects with same properties and values", () => {
    expect(shallowEquals({ a: 1 }, { a: 1 })).toBe(true)
  })

  test("should return false for objects with different number of properties", () => {
    expect(shallowEquals({ a: 1 }, { a: 1, b: 2 })).toBe(false)
  })

  test("should return false for objects with same properties but different values", () => {
    expect(shallowEquals({ a: 1 }, { a: 2 })).toBe(false)
  })

  test("should return true when properties are in different order", () => {
    expect(shallowEquals({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true)
  })

  test("should return true for arrays with same elements", () => {
    expect(shallowEquals([1, 2, 3], [1, 2, 3])).toBe(true)
  })

  test("should return false for arrays with different elements", () => {
    expect(shallowEquals([1, 2, 3], [1, 2, 4])).toBe(false)
  })

  test("should return false for arrays with same elements in different order", () => {
    expect(shallowEquals([1, 2, 3], [3, 2, 1])).toBe(false)
  })

  test("should return false when comparing object and array", () => {
    expect(shallowEquals({}, [])).toBe(false)
  })

  test("should return false when comparing different types", () => {
    expect(shallowEquals(1, "1")).toBe(false)
    expect(shallowEquals(true, false)).toBe(false)
    expect(shallowEquals(null, undefined)).toBe(false)
  })

  test("should return true when comparing same primitive values", () => {
    expect(shallowEquals(1, 1)).toBe(true)
    expect(shallowEquals("test", "test")).toBe(true)
    expect(shallowEquals(true, true)).toBe(true)
    expect(shallowEquals(null, null)).toBe(true)
    expect(shallowEquals(undefined, undefined)).toBe(true)
  })

  test("should handle nested objects shallowly", () => {
    const objA = { a: { b: 1 } }
    const objB = { a: { b: 1 } }
    expect(shallowEquals(objA, objB)).toBe(false)
    expect(shallowEquals(objA, objA)).toBe(true)
  })

  test("should ignore inherited properties", () => {
    const parent = { a: 1 }
    const child = Object.create(parent)
    child.b = 2

    expect(shallowEquals(child, { b: 2 })).toBe(true)
  })

  test("should return false when comparing functions", () => {
    const funcA = () => {}
    const funcB = () => {}
    expect(shallowEquals(funcA, funcB)).toBe(false)
    expect(shallowEquals(funcA, funcA)).toBe(true)
  })

  test("should handle dates", () => {
    const dateA = new Date(2020, 1, 1)
    const dateB = new Date(2020, 1, 1)
    expect(shallowEquals(dateA, dateB)).toBe(true)
    expect(shallowEquals(dateA, dateA)).toBe(true)
  })

  test("should handle symbols", () => {
    const symA = Symbol("a")
    const symB = Symbol("a")
    expect(shallowEquals(symA, symB)).toBe(false)
    expect(shallowEquals(symA, symA)).toBe(true)
  })
})
