import { dayjs } from "./Dayjs"

describe("Dayjs tests", () => {
  describe("Duration tests", () => {
    test("ceil to unit", () => {
      let duration = dayjs.duration(2.5, "months")
      expect(duration.ext.ceil("months")).toEqual(dayjs.duration(3, "months"))
      duration = dayjs.duration(0.5, "minutes")
      expect(duration.ext.ceil("minutes")).toEqual(dayjs.duration(1, "minute"))

      duration = dayjs.duration(30.5, "seconds")
      expect(duration.ext.ceil("minutes")).toEqual(dayjs.duration(1, "minute"))
      expect(duration.ext.ceil("seconds")).toEqual(
        dayjs.duration(31, "seconds")
      )
    })
  })
})
