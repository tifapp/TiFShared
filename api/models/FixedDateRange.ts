import { z } from "zod"
import { FixedDateRange } from "../../domain-models/FixedDateRange"

/**
 * A zod schema to parse an {@link FixedDateRange} where the start and end dates
 * are represented as raw date strings.
 */
export const FixedDateRangeSchema = z.optionalParseable(
  {
    parse: (arg: FixedDateRange | {startDateTime: string, endDateTime: string}) => {
      if (arg instanceof FixedDateRange) {
        return arg
      }

      const result = z.object({
        startDateTime: z.coerce.date(),
        endDateTime: z.coerce.date()
      }).safeParse(arg)

      if (!result.success) return result.error
        
      try {
        return new FixedDateRange(result.data.startDateTime, result.data.endDateTime)
      } catch (e) {
        return e
      }
    }
  },
)

const MIN_EVENT_DURATION = 60

/**
 * A Zod schema for creating a FixedDateRange with additional constraints for new Events:
 * - Duration must be at least MIN_EVENT_DURATION seconds.
 * - The end date cannot be in the past.
 */
export const CreateFixedDateRangeSchema = FixedDateRangeSchema.superRefine((dateRange, ctx) => {
  if (!dateRange) return;

  const { startDateTime, endDateTime } = dateRange;

  const sDate = new Date(startDateTime);
  const eDate = new Date(endDateTime);

  const secondDiff = (eDate.getTime() - sDate.getTime()) / 1000;
  const isEndDatePast = eDate < new Date();

  if (secondDiff < MIN_EVENT_DURATION) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_small,
      minimum: MIN_EVENT_DURATION,
      type: "number",
      inclusive: true,
      message: "The duration must be at least 60 seconds.",
      path: ["endDateTime"],
    });
  }

  if (isEndDatePast) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "The end date cannot be in the past.",
      path: ["endDateTime"],
    });
  }
});
