import { z } from "zod"
import { ColorStringSchema } from "../../domain-models/ColorString"
import {
  EventAttendeeSchema,
  EventDescriptionSchema,
  EventHostSchema,
  EventIDSchema,
  EventLocationSchema,
  EventPreviewAttendeeSchema,
  EventSettingsSchema,
  EventTitleSchema,
  EventUserAttendeeStatusSchema,
  EventWhenBlockedByHostSchema,
  TrackableEventArrivalRegionsSchema
} from "../../domain-models/Event"
import { TodayOrTomorrowSchema } from "../../domain-models/TodayOrTomorrow"
import { BlockedYouStatusSchema } from "../../domain-models/User"
import { ChatTokenRequestSchema } from "./Chat"
import { tifAPIErrorSchema } from "./Error"
import { FixedDateRangeSchema } from "./FixedDateRange"

export const EventTimeResponseSchema = z.object({
  secondsToStart: z.number(),
  todayOrTomorrow: TodayOrTomorrowSchema.optional(),
  dateRange: FixedDateRangeSchema
})

/**
 * Information on the time that an event starts.
 *
 * The goal of this type is to have the server provide as much information about the time upfront
 * since the user's device time can be flakey, or event blatantly incorrect.
 *
 * If `secondsToStart` is negative, then the event is officially underway.
 */
export type EventTimeResponse = z.rInfer<typeof EventTimeResponseSchema>

export const EventResponseSchema = z.object({
  id: EventIDSchema,
  title: EventTitleSchema,
  description: EventDescriptionSchema,
  color: ColorStringSchema.optional(),
  attendeeCount: z.number().nonnegative(),
  joinedDateTime: z.coerce.date().optional(),
  createdDateTime: z.coerce.date(),
  updatedDateTime: z.coerce.date(),
  hasArrived: z.boolean(),
  isChatExpired: z.boolean(),
  userAttendeeStatus: EventUserAttendeeStatusSchema,
  settings: EventSettingsSchema,
  time: EventTimeResponseSchema,
  location: EventLocationSchema,
  previewAttendees: z.array(EventAttendeeSchema),
  host: EventHostSchema,
  endedDateTime: z.coerce.date().optional()
})

export type EventResponse = z.rInfer<typeof EventResponseSchema>

export const JoinEventResponseSchema =
  TrackableEventArrivalRegionsSchema.extend({
    id: EventIDSchema,
    chatToken: ChatTokenRequestSchema.optional(),
    hasArrived: z.boolean()
  })

export type JoinEventResponse = z.rInfer<typeof JoinEventResponseSchema>

export const EventNotFoundErrorSchema = tifAPIErrorSchema("event-not-found")

export const EventsInAreaResponseSchema = z.object({
  events: z.array(EventResponseSchema)
})

export type EventsInAreaResponse = z.rInfer<typeof EventsInAreaResponseSchema>

export const EventWhenBlockedByHostResponseSchema =
  EventWhenBlockedByHostSchema.merge(
    tifAPIErrorSchema(BlockedYouStatusSchema.value)
  )
