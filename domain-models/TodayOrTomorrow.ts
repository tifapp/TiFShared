import { z } from "zod"

export const TodayOrTomorrowSchema = z.enum([
  "today",
  "tomorrow"
])

export type TodayOrTomorrow = z.infer<typeof TodayOrTomorrowSchema>
