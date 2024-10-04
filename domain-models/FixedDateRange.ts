import { ZodError, z } from "zod"

/**
 * A data type to deal with a date range that has a known start and end date.
 *
 * When either the start date is set after the end date or vice versa, the other date
 * is fixed to the correct position using the previous interval between the 2 dates:
 *
 * ```ts
 * // Makes range.endDateTime "new Date(3)" because the previous interval was 1 second
 * const range = dateRange(new Date(0), new Date(1))?
 *   .moveStartWithAutocorrection(new Date(2))
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
    return this.endDateTime.ext.diff(this.startDateTime)
  }

  constructor(
    readonly startDateTime: Date,
    readonly endDateTime: Date
  ) {
    if (startDateTime > endDateTime) {
      throw new Error("Start Date must be before End Date.")
    }
  }

  /**
   * Sets the start date of this range adjusting the end date ahead of the
   * start date by amount of the previous interval between the 2 dates.
   */
  moveStartWithAutocorrection(date: Date) {
    const { seconds } = date.ext.diff(this.endDateTime)
    if (date > this.endDateTime) {
      return new FixedDateRange(date, date.ext.addSeconds(seconds))
    }
    return new FixedDateRange(date, this.endDateTime)
  }

  /**
   * Sets the start date of this range adjusting the start date to be behind
   * the end date by amount of the previous interval between the 2 dates.
   */
  moveEndWithAutocorrection(date: Date) {
    const { seconds } = date.ext.diff(this.startDateTime)
    if (date < this.startDateTime) {
      return new FixedDateRange(date.ext.addSeconds(seconds), date)
    }
    return new FixedDateRange(this.startDateTime, date)
  }
}

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
