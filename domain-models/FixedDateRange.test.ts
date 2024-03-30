import { dateRange } from "./FixedDateRange"

describe("FixedDateRange tests", () => {
  test("diff", () => {
    const range = dateRange(
      new Date("2023-02-25T00:17:00"),
      new Date("2023-02-25T00:18:00")
    )
    expect(range?.diff.minutes).toEqual(1)
  })

  it("should return undefined when start date is greater than end date", () => {
    const range = dateRange(
      new Date("2023-02-25T00:19:00"),
      new Date("2023-02-25T00:18:00")
    )
    expect(range).toBeUndefined()
  })

  test("moveStartDate basic", () => {
    const range = dateRange(
      new Date("2023-02-25T00:17:00"),
      new Date("2023-02-25T00:18:00")
    )?.moveStartDateWithAutocorrection(new Date(0))
    expect(range?.startDate).toEqual(new Date(0))
    expect(range?.endDate).toEqual(new Date("2023-02-25T00:18:00"))
  })

  test("moveEndDate basic", () => {
    const newEndDate = new Date("3000-01-01T00:00:00")
    const range = dateRange(
      new Date("2023-02-25T00:17:00"),
      new Date("2023-02-25T00:18:00")
    )?.moveEndDateWithAutocorrection(newEndDate)
    expect(range?.startDate).toEqual(new Date("2023-02-25T00:17:00"))
    expect(range?.endDate).toEqual(newEndDate)
  })

  it("moving start date past end date moves end date past the start date by the previous interval between the dates", () => {
    const range = dateRange(
      new Date("2023-02-25T00:17:00"),
      new Date("2023-02-25T00:18:00")
    )?.moveStartDateWithAutocorrection(new Date("2023-02-25T00:19:00"))
    // NB: The previous interval was 1 minute, so we ensure the end date is 1 minute ahead of the start date
    expect(range?.endDate).toEqual(new Date("2023-02-25T00:20:00"))
  })

  it("moving end date before start date moves start date before the end date by the previous interval between the dates", () => {
    const range = dateRange(
      new Date("2023-02-25T00:17:00"),
      new Date("2023-02-25T00:18:00")
    )?.moveEndDateWithAutocorrection(new Date("2023-02-25T00:16:00"))
    // NB: The previous interval was 1 minute, so we ensure the start date is 1 minute behind of the end date
    expect(range?.startDate).toEqual(new Date("2023-02-25T00:15:00"))
  })
})
