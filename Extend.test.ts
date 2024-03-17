import { extension } from "./Extend"

describe("Extension tests", () => {
  test("extending basic type", () => {
    class Thing {
      prop = 1
    }
    const ext = extension(Thing, { double: (t) => t.prop * 2 })
    expect(ext(new Thing()).double()).toEqual(2)
  })

  it("should return the same reference to the array", () => {
    const nums = [1, 2, 3, 4]
    expect(nums).toBe(nums.ext)
  })

  it("should return the same reference to the array with multiple extensions", () => {
    const nums = [1, 2, 3, 4]
    expect(nums).toBe(nums.ext.ext.ext)
  })
})
