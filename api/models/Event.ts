import { z } from "zod"
import { ColorStringSchema } from "../../domain-models/ColorString"
import {
  EventAttendeeSchema,
  EventIDSchema,
  EventLocationSchema,
  EventPreviewAttendeeSchema,
  EventSettingsSchema,
  EventUserAttendeeStatusSchema,
  EventWhenBlockedByHostSchema,
  TrackableEventArrivalRegionsSchema
} from "../../domain-models/Event"
import { LocationCoordinate2DSchema } from "../../domain-models/LocationCoordinate2D"
import { TodayOrTomorrowSchema } from "../../domain-models/TodayOrTomorrow"
import { StringDateSchema } from "../../lib/Date"
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

const EventTitleSchema = z.string().max(50)
const EventDescriptionSchema = z.string().max(500)

export const CreateEventSchema = z
  .object({
    description: EventDescriptionSchema,
    dateRange: FixedDateRangeSchema,
    color: ColorStringSchema,
    title: EventTitleSchema,
    shouldHideAfterStartDate: z.boolean(),
    isChatEnabled: z.boolean(),
    coordinates: LocationCoordinate2DSchema
  })

export type CreateEvent = z.rInfer<typeof CreateEventSchema>

export const EventResponseSchema = z.object({
  id: EventIDSchema,
  title: z.string(), // TODO: - Decide max length.
  description: z.string().max(500),
  color: ColorStringSchema,
  attendeeCount: z.number().nonnegative(),
  joinedDateTime: StringDateSchema.optional(),
  createdDateTime: StringDateSchema,
  updatedDateTime: StringDateSchema,
  hasArrived: z.boolean(),
  isChatExpired: z.boolean(),
  userAttendeeStatus: EventUserAttendeeStatusSchema,
  settings: EventSettingsSchema,
  time: EventTimeResponseSchema,
  location: EventLocationSchema,
  previewAttendees: z.array(EventPreviewAttendeeSchema),
  host: EventAttendeeSchema,
  endedDateTime: StringDateSchema.optional()
})

export type EventResponse = z.rInfer<typeof EventResponseSchema>

export const JoinEventResponseSchema =
  TrackableEventArrivalRegionsSchema.extend({
    id: EventIDSchema,
    chatToken: ChatTokenRequestSchema,
    hasArrived: z.boolean()
  })

export type JoinEventResponse = z.rInfer<typeof JoinEventResponseSchema>

export const EventNotFoundErrorSchema = tifAPIErrorSchema("event-not-found")

export const EventsInAreaResponseSchema = z.object({
  events: z.array(EventResponseSchema)
})

export type EventsInAreaResponse = z.rInfer<typeof EventsInAreaResponseSchema>

export const EventWhenBlockedByHostResponseSchema =
  EventWhenBlockedByHostSchema.omit({
    createdAt: true,
    updatedAt: true
  }).extend({ createdAt: StringDateSchema, updatedAt: StringDateSchema })
