import { sin2, degreesToRadians, roundToDenominator } from "./Math"

describe("ExtendedMath tests", () => {
  test("degreesToRadians", () => {
    expect(degreesToRadians(42)).toBeCloseTo(0.733038)
  })

  test("sin2", () => {
    expect(sin2(1)).toBeCloseTo(0.708)
  })

  test("roundToHalf", () => {
    expect(roundToDenominator(1, 2)).toEqual(1)
    expect(roundToDenominator(1.23, 2)).toEqual(1)
    expect(roundToDenominator(1.25, 2)).toEqual(1.5)
    expect(roundToDenominator(1.33, 2)).toEqual(1.5)
    expect(roundToDenominator(1.5, 2)).toEqual(1.5)
    expect(roundToDenominator(1.55, 2)).toEqual(1.5)
    expect(roundToDenominator(1.74, 2)).toEqual(1.5)
    expect(roundToDenominator(1.75, 2)).toEqual(2)
    expect(roundToDenominator(1.82, 2)).toEqual(2)
    expect(roundToDenominator(1.99, 2)).toEqual(2)
    expect(roundToDenominator(2, 2)).toEqual(2)
    expect(roundToDenominator(3.2, 3)).toBeCloseTo(3.333333333333)
    expect(roundToDenominator(3.01, 3)).toEqual(3)
    expect(roundToDenominator(3.75, 3)).toBeCloseTo(3.666666666666)
    expect(roundToDenominator(3.95, 3)).toEqual(4)
  })
})
