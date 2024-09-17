import { z } from "zod"
import { dateRange } from "../../domain-models/FixedDateRange"
import { StringDateSchema } from "../../lib/Date"

export type StringDateRangeResponse = {
  startDateTime: string
  endDateTime: string
}

const MIN_EVENT_DURATION = 60

/**
 * A zod schema to parse an {@link FixedDateRange} where the start and end dates
 * are represented as raw date strings.
 */
export const FixedDateRangeSchema = z.optionalParseable(
  {
    parse: ({ startDateTime, endDateTime }: StringDateRangeResponse) => {
      const sDate = StringDateSchema.safeParse(startDateTime)
      const eDate = StringDateSchema.safeParse(endDateTime)
      if (!sDate.success || !eDate.success) return undefined
      return dateRange(sDate.data, eDate.data)
    }
  },
  (r) => {
    return `${r}`
  }
)

export const CreateFixedDateRangeSchema = FixedDateRangeSchema.superRefine((dateRange, ctx) => {
  if (!dateRange) return;

  const { startDateTime, endDateTime } = dateRange;

  const startDate = new Date(startDateTime)
  const endDate = new Date(endDateTime)

  const secondDiff = (+endDate - +startDate) / 1000;
  const isEndDatePast = endDate < new Date();

  if (secondDiff < MIN_EVENT_DURATION) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "The duration must be at least 60 seconds."
    });
  }

  if (isEndDatePast) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "The end date cannot be in the past."
    });
  }
})