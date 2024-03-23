import { metersToMiles, milesToFeet, milesToMeters } from "./MetricConversions"

describe("MetricConversions tests", () => {
  test("miles to meters", () => {
    expect(milesToMeters(0)).toEqual(0)
    expect(milesToMeters(2.9839)).toBeCloseTo(4802.12156)
    expect(milesToMeters(4802.12156)).toBeCloseTo(7728265.519857)
  })

  test("miles to feet", () => {
    expect(milesToFeet(0)).toEqual(0)
    expect(milesToFeet(2.9839)).toBeCloseTo(15754.992)
    expect(milesToFeet(4802.12156)).toBeCloseTo(25355201.836801178753)
  })

  test("meters to miles", () => {
    expect(metersToMiles(0)).toEqual(0)
    expect(metersToMiles(4802.12156)).toBeCloseTo(2.9839)
    expect(metersToMiles(7728265.519857)).toBeCloseTo(4802.12156)
  })
})
