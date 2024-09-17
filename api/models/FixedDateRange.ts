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
      console.error("start date is", startDateTime)
      console.error("end date is ", endDateTime)
      const sDate = StringDateSchema.safeParse(startDateTime)
      const eDate = StringDateSchema.refine(
        (date) => date > new Date(), //account for server delay???
        {
          message: "endDateTime must be in the future"
        }
      ).refine(
        (date) => date > new Date(startDateTime),
        {
          message: "endDateTime must be after startDateTime"
        }
      ).refine(
        //@ts-ignore date comparison
        (date) => (date - (new Date(startDateTime))) > MIN_EVENT_DURATION,
        {
          message: `endDateTime must be at least ${MIN_EVENT_DURATION}`
        }
      ).safeParse(endDateTime)
      if (!sDate.success || !eDate.success) return undefined
      return dateRange(sDate.data, eDate.data)
    }
  },
  (r) => {
    return `${r}`
  }
)
