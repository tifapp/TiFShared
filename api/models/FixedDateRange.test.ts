import { dateRange } from "../../domain-models/FixedDateRange"
import { FixedDateRangeSchema } from "./FixedDateRange"

describe("FixedDateRangeAPI tests", () => {
  test("pass FixedDateRange instances", () => {
    const testRange = dateRange(
      new Date("2024-02-25T00:19:00.00Z"),
      new Date("2024-02-25T00:20:00.00Z")
    )

    expect(FixedDateRangeSchema.parse(testRange)).toEqual(testRange)
  })

  test("valid FixedDateRange", () => {
    expect(FixedDateRangeSchema.parse({
      startDateTime: "2023-02-25T00:19:00.00Z",
      endDateTime: "2023-02-25T00:20:00.00Z"
    })).toEqual(dateRange(
      new Date("2023-02-25T00:19:00.00Z"),
      new Date("2023-02-25T00:20:00.00Z")
    ))
  })

  test("invalid dates", () => {
    expect(() => FixedDateRangeSchema.parse({
      startDateTime: "iuahbxgwd7823823geg",
      endDateTime: "2023-02-25T00:18:00.00Z"
    })).toThrow("Invalid date")
    
    expect(() => FixedDateRangeSchema.parse({
      startDateTime: "2023-02-25T00:18:00.00Z",
      endDateTime: "899832ue982hdh"
    })).toThrow("Invalid date")
  })
  
  test("start date before end date", () => {
    expect(() => FixedDateRangeSchema.parse({
      startDateTime: "2023-02-25T00:19:00.00Z",
      endDateTime: "2023-02-25T00:18:00.00Z"
    })).toThrow(`Start Date must be before End Date.`)
  })
})
