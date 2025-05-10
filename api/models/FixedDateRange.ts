import { z } from "zod"
import { FixedDateRange } from "../../domain-models/FixedDateRange"

/**
 * A zod schema to parse an {@link FixedDateRange} where the start and end dates
 * are represented as raw date strings.
 */
export const FixedDateRangeSchema = z.optionalParseable(
  FixedDateRange,
  z
    .object({
      startDateTime: z.coerce.date(),
      endDateTime: z.coerce.date()
    })
    .transform(({ startDateTime, endDateTime }) => {
      return new FixedDateRange(startDateTime, endDateTime)
    })
)

export const MIN_EVENT_DURATION = 60

export const UpcomingEventsFixedDateRangeSchema =
  z.base64URLDecodedJSON(FixedDateRangeSchema)

/**
 * A Zod schema for creating a FixedDateRange with additional constraints for new Events:
 * - Duration must be at least MIN_EVENT_DURATION seconds.
 * - The end date cannot be in the past.
 */
export const CreateFixedDateRangeSchema = FixedDateRangeSchema.superRefine(
  (dateRange, ctx) => {
    if (process.env.API_GENERATION_ENVIRONMENT) {
      // NB: dateRange is null when generating openapi schema
      return
    }

    const { startDateTime, endDateTime } = dateRange

    const secondDiff = (endDateTime.getTime() - startDateTime.getTime()) / 1000
    const isEndDatePast = endDateTime < new Date() // TODO: Compare with server's timezone

    if (secondDiff < MIN_EVENT_DURATION) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "The duration must be at least 60 seconds.",
        fatal: true
      })
    }

    if (isEndDatePast) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "The end date cannot be in the past.",
        fatal: true
      })
    }
  }
)
