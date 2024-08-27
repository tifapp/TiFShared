import "./Math"

describe("ExtendedMath tests", () => {
  test("degreesToRadians", () => {
    expect(Math.degreesToRadians(42)).toBeCloseTo(0.733038)
  })

  test("sin2", () => {
    expect(Math.sin2(1)).toBeCloseTo(0.708)
  })

  test("roundToHalf", () => {
    expect(Math.roundToDenominator(1, 2)).toEqual(1)
    expect(Math.roundToDenominator(1.23, 2)).toEqual(1)
    expect(Math.roundToDenominator(1.25, 2)).toEqual(1.5)
    expect(Math.roundToDenominator(1.33, 2)).toEqual(1.5)
    expect(Math.roundToDenominator(1.5, 2)).toEqual(1.5)
    expect(Math.roundToDenominator(1.55, 2)).toEqual(1.5)
    expect(Math.roundToDenominator(1.74, 2)).toEqual(1.5)
    expect(Math.roundToDenominator(1.75, 2)).toEqual(2)
    expect(Math.roundToDenominator(1.82, 2)).toEqual(2)
    expect(Math.roundToDenominator(1.99, 2)).toEqual(2)
    expect(Math.roundToDenominator(2, 2)).toEqual(2)
    expect(Math.roundToDenominator(3.2, 3)).toBeCloseTo(3.333333333333)
    expect(Math.roundToDenominator(3.01, 3)).toEqual(3)
    expect(Math.roundToDenominator(3.75, 3)).toBeCloseTo(3.666666666666)
    expect(Math.roundToDenominator(3.95, 3)).toEqual(4)
  })

  test.each([
    [0, 0.5, 1, 0.5],
    [10, 9, 20, 10],
    [0, 50, 40, 40]
  ])("clamp %d %d %d %d", (min, value, max, expected) => {
    expect(Math.clamp(min, max, value)).toEqual(expected)
  })
})
