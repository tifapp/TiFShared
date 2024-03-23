import {
  LocationCoordinate2DSchema,
  coordinateDistance
} from "./LocationCoordinate2D"

describe("LocationCoordinate2D tests", () => {
  test("zod schema", () => {
    let result = LocationCoordinate2DSchema.safeParse({
      latitude: -23489273.129078348902,
      longitude: 29.93879823
    })
    expect(result.success).toEqual(false)

    result = LocationCoordinate2DSchema.safeParse({
      latitude: -45.129078348902,
      longitude: 290839082.93879823
    })
    expect(result.success).toEqual(false)

    result = LocationCoordinate2DSchema.safeParse({
      latitude: 423842035.129078348902,
      longitude: -32.93879823
    })
    expect(result.success).toEqual(false)

    result = LocationCoordinate2DSchema.safeParse({
      latitude: 42.129078348902,
      longitude: -2903782.93879823
    })
    expect(result.success).toEqual(false)

    result = LocationCoordinate2DSchema.safeParse({
      latitude: 42.129078348902,
      longitude: -29.93879823
    })
    expect(result).toEqual({
      success: true,
      data: {
        latitude: 42.129078348902,
        longitude: -29.93879823
      }
    })
  })

  test("miles between coordinates", () => {
    let c1 = { latitude: 45, longitude: 45 }
    let c2 = { latitude: 45, longitude: 45 }
    expect(coordinateDistance(c1, c2, "miles")).toEqual(0)

    c2.latitude = -45
    expect(coordinateDistance(c1, c2, "miles")).toBeCloseTo(6218.4)

    c1.longitude = -45
    expect(coordinateDistance(c1, c2, "miles")).toBeCloseTo(8291.2)

    c1.latitude = 67.29879872
    expect(coordinateDistance(c1, c2, "miles")).toBeCloseTo(9031.69)
  })

  test("meters between coordinates", () => {
    let c1 = { latitude: 45, longitude: 45 }
    let c2 = { latitude: 45, longitude: 45 }
    expect(coordinateDistance(c1, c2, "meters")).toEqual(0)

    c2.latitude = -45
    expect(coordinateDistance(c1, c2, "meters")).toBeCloseTo(10007543.4)

    c1.longitude = -45
    expect(coordinateDistance(c1, c2, "meters")).toBeCloseTo(13343391.2)

    c1.latitude = 67.29879872
    expect(coordinateDistance(c1, c2, "meters")).toBeCloseTo(14535100.0)
  })
})
