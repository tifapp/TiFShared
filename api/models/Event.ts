import { TodayOrTomorrowSchema } from "../../domain-models/TodayOrTomorrow"
import { ColorStringSchema } from "../../domain-models/ColorString"
import {
  EventAttendeeSchema,
  EventIDSchema,
  EventLocationSchema,
  EventPreviewAttendeeSchema,
  EventSettingsSchema,
  EventUserAttendeeStatusSchema,
  EventWhenBlockedByHostAttendeeSchema,
  TrackableEventArrivalRegionsSchema
} from "../../domain-models/Event"
import { z } from "zod"
import { StringDateSchema } from "../../lib/Date"
import { tifAPIErrorSchema } from "./Error"
import { ChatTokenRequestSchema } from "./Chat"
import { FixedDateRangeSchema } from "./FixedDateRange"

export const EventTimeResponseSchema = z.object({
  secondsToStart: z.number(),
  todayOrTomorrow: TodayOrTomorrowSchema.nullable(),
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
export type EventTimeResponse = z.infer<typeof EventTimeResponseSchema>

export const EventResponseSchema = z.object({
  id: EventIDSchema,
  title: z.string(), // TODO: - Decide max length.
  description: z.string(),
  color: ColorStringSchema,
  attendeeCount: z.number().nonnegative(),
  joinDate: StringDateSchema.nullable(),
  createdAt: StringDateSchema,
  updatedAt: StringDateSchema,
  hasArrived: z.boolean(),
  isChatExpired: z.boolean(),
  userAttendeeStatus: EventUserAttendeeStatusSchema,
  settings: EventSettingsSchema,
  time: EventTimeResponseSchema,
  location: EventLocationSchema,
  previewAttendees: z.array(EventPreviewAttendeeSchema),
  host: EventAttendeeSchema,
  endedAt: StringDateSchema.nullable()
})

export type EventResponse = z.infer<typeof EventResponseSchema>

export const EventWhenBlockedByHostResponseSchema = EventResponseSchema.omit({
  host: true
})
  .pick({
    id: true,
    title: true,
    createdAt: true,
    updatedAt: true
  })
  .extend({ host: EventWhenBlockedByHostAttendeeSchema })

export type EventWhenBlockedByHostResponse = z.infer<
  typeof EventWhenBlockedByHostResponseSchema
>

export const JoinEventResponseSchema =
  TrackableEventArrivalRegionsSchema.extend({
    id: EventIDSchema,
    chatToken: ChatTokenRequestSchema,
    hasArrived: z.boolean()
  })

export type JoinEventResponse = z.infer<typeof JoinEventResponseSchema>

export const EventNotFoundErrorSchema = tifAPIErrorSchema("event-not-found")

export const EventsInAreaResponseSchema = z.object({
  events: z.array(EventResponseSchema)
})

export type EventsInAreaResponse = z.rInfer<typeof EventsInAreaResponseSchema>
