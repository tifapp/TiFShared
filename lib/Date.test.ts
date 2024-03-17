import { dayjs } from "./Date/Dayjs"
import "./Date"

describe("ExtendedDate tests", () => {
  test("diff dates, no difference for same exact date", () => {
    const date = new Date()
    expect(date.ext.diff(date)).toEqual({
      milliseconds: 0,
      seconds: 0,
      minutes: 0,
      hours: 0,
      days: 0,
      weeks: 0,
      months: 0,
      years: 0
    })
  })

  test("diff dates, basic", () => {
    const date = new Date("2024-03-16T00:00:00.00Z")
    const date2 = new Date("2024-03-15T00:00:00.00Z")
    expect(date.ext.diff(date2)).toEqual({
      milliseconds: 24 * 60 * 60 * 1000,
      seconds: 24 * 60 * 60,
      minutes: 24 * 60,
      hours: 24,
      days: 1,
      weeks: expect.closeTo(1 / 7),
      months: expect.closeTo(1 / 31),
      years: expect.closeTo(1 / 365)
    })
  })

  test("add to date", () => {
    const date = new Date("2024-03-16T00:00:00.00Z")
    expect(date.ext.add(63, "minutes")).toEqual(
      new Date("2024-03-16T01:03:00.00Z")
    )
    expect(date.ext.add(-1, "days")).toEqual(
      new Date("2024-03-15T00:00:00.00Z")
    )
    expect(date.ext.add(0, "years")).toEqual(date)
    expect(date.ext.addSeconds(10)).toEqual(new Date("2024-03-16T00:00:10.00Z"))
    expect(date.ext.add(1, "seconds").add(-1, "seconds")).toEqual(date)
  })
})
