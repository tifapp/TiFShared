import dayjs from "dayjs"
import duration, { Duration, DurationUnitType } from "dayjs/plugin/duration"
import isToday from "dayjs/plugin/isToday"
import isTomorrow from "dayjs/plugin/isTomorrow"
import isYesterday from "dayjs/plugin/isYesterday"
import isBetween from "dayjs/plugin/isBetween"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import relativeTime from "dayjs/plugin/relativeTime"
import { Extension, protoypeExtension } from "./Extend"
import { AnyClassInstance } from "./HelperTypes"

dayjs.extend(isSameOrAfter)
dayjs.extend(duration)
dayjs.extend(isToday)
dayjs.extend(isTomorrow)
dayjs.extend(isYesterday)
dayjs.extend(isBetween)
dayjs.extend(relativeTime)

const durationExtensions = {
  /**
   * Ceils a {@link Duration} to a given unit and returns a new {@link Duration}
   * represented by the given unit type.
   *
   * ```ts
   * dayjs.duration(2.5, "days").ext.ceil("days") // Returns a duration of 3 days
   * ```
   */
  ceil: (duration: Duration, unit: DurationUnitType) => {
    return dayjs.duration(Math.ceil(duration.as(unit)), unit)
  }
}

export interface ExtendedDuration
  extends Extension<Duration, typeof durationExtensions> {}

declare module "dayjs/plugin/duration" {
  export interface Duration {
    get ext(): ExtendedDuration
  }
}

// NB: The Duration prototype is internal so we can't use it directly, but we
// can create an instance of it and retrieve the prototype indirectly.
const d = dayjs.duration(0) as AnyClassInstance
protoypeExtension(d.constructor, durationExtensions)

/**
 * An intentful function to return the current date in dayjs terms.
 */
export const now = () => dayjs()

export { dayjs }
