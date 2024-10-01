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
