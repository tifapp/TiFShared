import { ext } from "./Extend"

describe("Extend tests", () => {
  it("should return the same reference to the array", () => {
    const nums = [1, 2, 3, 4]
    expect(nums).toBe(ext(nums))
  })
})
