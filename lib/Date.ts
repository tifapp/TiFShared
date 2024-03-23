import { dayjs } from "./Dayjs"
import { Extension, protoypeExtension } from "./Extend"
import { z } from "zod"

export type DateUnit = dayjs.ManipulateType

export interface ExtendedDate extends Extension<Date, typeof extensions> {}

declare global {
  interface Date {
    get ext(): ExtendedDate
  }
}

const extensions = {
  /**
   * Computes the difference between 2 dates in a variety of units.
   */
  diff: (date1: Date, date2: Date) => {
    const d1 = dayjs(date1)
    const d2 = dayjs(date2)
    return {
      milliseconds: d1.diff(d2, "milliseconds", true),
      seconds: d1.diff(d2, "seconds", true),
      minutes: d1.diff(d2, "minutes", true),
      hours: d1.diff(d2, "hours", true),
      days: d1.diff(d2, "days", true),
      weeks: d1.diff(d2, "weeks", true),
      months: d1.diff(d2, "months", true),
      years: d1.diff(d2, "years", true)
    }
  },
  /**
   * Adds the designated number of units to a date and returns the result.
   */
  add: (date: Date, amount: number, unit: DateUnit) => {
    return dayjs(date).add(amount, unit).toDate().ext
  },
  /**
   * Adds the designated number of seconds to a date and returns the result.
   */
  addSeconds: (date: Date, amount: number) => {
    return date.ext.add(amount, "seconds")
  }
}

protoypeExtension(Date, extensions)

/**
 * A zod schema that parses from a string to a date.
 */
export const StringDateSchema = z
  .string()
  .datetime()
  .transform((date) => new Date(date))
