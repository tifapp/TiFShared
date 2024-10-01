import { z } from "zod"
import { FixedDateRange } from "../../domain-models/FixedDateRange"

/**
 * A zod schema to parse an {@link FixedDateRange} where the start and end dates
 * are represented as raw date strings.
 */
export const FixedDateRangeSchema = z.optionalParseable(
  FixedDateRange,
  (arg: {startDateTime: string, endDateTime: string}) => {
    const parsedArg = z.object({
      startDateTime: z.coerce.date(),
      endDateTime: z.coerce.date()
    }).parse(arg)
    
    return new FixedDateRange(parsedArg.startDateTime, parsedArg.endDateTime)
  }
)