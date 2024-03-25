import { z } from "zod"
import { StringDateSchema } from "../lib/Date"

/**
 * A data type to deal with a date range that has a known start and end date.
 *
 * When either the start date is set after the end date or vice versa, the other date
 * is fixed to the correct position using the previous interval between the 2 dates:
 *
 * ```ts
 * // Makes range.endDate "new Date(3)" because the previous interval was 1 second
 * const range = dateRange(new Date(0), new Date(1))?
 *   .moveStartDateWithAutocorrection(new Date(2))
 * ```
 *
 * If the intial start date and end date are incompatible with each other, this
 * class cannot be constructed.
 *
 * ```ts
 * const range = dateRange(new Date(1), new Date(0)) // Returns undefined
 * ```
 */
export class FixedDateRange {
  /**
   * Returns a diff between the end date and start date.
   *
   * The diff values are based off the end date and thus are always positive.
   */
  get diff() {
    return this.endDate.ext.diff(this.startDate)
  }

  constructor(
    readonly startDate: Date,
    readonly endDate: Date
  ) {
    if (startDate > endDate) {
      throw new Error("Start Date must be before End Date.")
    }
  }

  /**
   * Sets the start date of this range adjusting the end date ahead of the
   * start date by amount of the previous interval between the 2 dates.
   */
  moveStartDateWithAutocorrection(date: Date) {
    const { seconds } = date.ext.diff(this.endDate)
    if (date > this.endDate) {
      return new FixedDateRange(date, date.ext.addSeconds(seconds))
    }
    return new FixedDateRange(date, this.endDate)
  }

  /**
   * Sets the start date of this range adjusting the start date to be behind
   * the end date by amount of the previous interval between the 2 dates.
   */
  moveEndDateWithAutocorrection(date: Date) {
    const { seconds } = date.ext.diff(this.startDate)
    if (date < this.startDate) {
      return new FixedDateRange(date.ext.addSeconds(seconds), date)
    }
    return new FixedDateRange(this.startDate, date)
  }
}

/**
 * A zod schema to parse an {@link FixedDateRange} where the start and end dates
 * are represented as raw date strings.
 */
export const FixedDateRangeSchema = z.optionalParseable({
  parse: ({
    startDateTime,
    endDateTime
  }: {
    startDateTime: string
    endDateTime: string
  }) => {
    const sDate = StringDateSchema.safeParse(startDateTime)
    const eDate = StringDateSchema.safeParse(endDateTime)
    if (!sDate.success || !eDate.success) return undefined
    return dateRange(sDate.data, eDate.data)
  }
})

/**
 * Creates a date range object iff the start date is less than or equal to the
 * end date.
 */
export const dateRange = (start: Date, end: Date) => {
  try {
    return new FixedDateRange(start, end)
  } catch {
    return undefined
  }
}
