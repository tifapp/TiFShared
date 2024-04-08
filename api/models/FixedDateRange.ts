import { dateRange } from "../../domain-models/FixedDateRange"
import { StringDateSchema } from "../../lib/Date"
import { z } from "zod"

export type StringDateRangeResponse = {
  startDateTime: string
  endDateTime: string
}

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
  () => {
    return `Response must have startDateTime before endDateTime.`
  }
)
