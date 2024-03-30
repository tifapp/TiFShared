import { dateRange } from "../../domain-models/FixedDateRange"
import { FixedDateRangeSchema } from "./FixedDateRange"

describe("FixedDateRangeAPI tests", () => {
  test("zod schema", () => {
    let result = FixedDateRangeSchema.safeParse({
      startDateTime: "2023-02-25T00:19:00.00Z",
      endDateTime: "2023-02-25T00:18:00.00Z"
    })
    expect(result.success).toEqual(false)
    result = FixedDateRangeSchema.safeParse({
      startDateTime: "2023-02-25T00:19:00.00Z",
      endDateTime: "2023-02-25T00:20:00.00Z"
    })
    expect(result).toEqual({
      success: true,
      data: dateRange(
        new Date("2023-02-25T00:19:00.00Z"),
        new Date("2023-02-25T00:20:00.00Z")
      )
    })
    result = FixedDateRangeSchema.safeParse({
      startDateTime: "iuahbxgwd7823823geg",
      endDateTime: "2023-02-25T00:18:00.00Z"
    })
    expect(result.success).toEqual(false)
    result = FixedDateRangeSchema.safeParse({
      startDateTime: "2023-02-25T00:18:00.00Z",
      endDateTime: "899832ue982hdh"
    })
    expect(result.success).toEqual(false)
  })
})
