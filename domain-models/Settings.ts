import { z } from "zod"
import { EventEditLocationSchema } from "./Event"

export const UserSettingsVersionSchema = z.number().nonnegative()

export type UserSettingsVersion = z.infer<typeof UserSettingsVersionSchema>

export const EventCalendarWeekdaySchema = z.union([
  z.literal("sunday"),
  z.literal("monday"),
  z.literal("tuesday"),
  z.literal("wednesday"),
  z.literal("thursday"),
  z.literal("friday"),
  z.literal("saturday")
])

export type EventCalendarWeekdayID = z.infer<typeof EventCalendarWeekdaySchema>

export const EventCalendarLayoutIDSchema = z.union([
  z.literal("single-day-layout"),
  z.literal("week-layout"),
  z.literal("month-layout")
])

export type EventCalendarLayoutID = z.infer<typeof EventCalendarLayoutIDSchema>

/**
 * A zod schema for {@link PushNotificationTriggerID}.
 */
export const PushNotificationTriggerIDSchema = z.union([
  z.literal("friend-request-received"),
  z.literal("friend-request-accepted"),
  z.literal("user-entered-region"),
  z.literal("event-attendance-headcount"),
  z.literal("event-periodic-arrivals"),
  z.literal("event-starting-soon"),
  z.literal("event-started"),
  z.literal("event-ended"),
  z.literal("event-name-changed"),
  z.literal("event-description-changed"),
  z.literal("event-time-changed"),
  z.literal("event-location-changed"),
  z.literal("event-cancelled")
])

/**
 * A string id for a trigger when a push notification should be sent to
 * the user.
 *
 * `"friend-request-received"` -> Triggers when the user received a friend
 * request from another user.
 *
 * `"friend-request-accepted"` -> Triggers when another user accpets the user's
 * friend request.
 *
 * `"user-entered-region"` -> Triggers when the user enters the arrival radius
 * for the event within the tracking period.
 *
 * `"event-attendance-headcount"` -> Triggers when an event starts with an update
 * on the headcount of attendees who are at the event.
 *
 * `"event-periodic-arrivals"` -> Triggers at periodic intervals throughout the
 * duration of an event with updates on the arrival statuses of all
 * participants.
 *
 * `"event-starting-soon"` -> Triggers x minutes (user-specified) before the event starts.
 *
 * `"event-started"` -> Triggers when the event starts.
 *
 * `"event-ended"` -> Triggers when the event ends.
 *
 * `"event-name-changed"` -> Triggers when the event name changes.
 *
 * `"event-description-changed"` -> Triggers when the event description changes.
 *
 * `"event-time-changed"` -> Triggers when either the start time or duration of the
 * event changes.
 *
 * `"event-location-changed"` -> Triggers when the event location changes.
 *
 * `"event-cancelled"` -> Triggers when the event is cancelled.
 */
export type PushNotificationTriggerID = z.infer<
  typeof PushNotificationTriggerIDSchema
>

/**
 * A utility to toggle on or off an element in a setttings trigger set.
 */
export const toggleSettingsTriggerId = <TriggerID extends string>(
  ids: TriggerID[],
  id: TriggerID,
  isEnabled: boolean
) => {
  const filteredTriggers = ids.filter((t) => t !== id)
  return isEnabled ? filteredTriggers.concat(id) : filteredTriggers
}

export const formatEventDurationPreset = (durationInSeconds: number) => {
  const minutes = Math.floor(durationInSeconds / 60) % 60
  const hours = Math.floor(durationInSeconds / 3600)

  if (minutes > 0 && hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes === 0 && hours > 0) {
    return `${hours}h`
  } else {
    return `${minutes}m`
  }
}

/**
 * A zod schema for {@link UserSettingsSchema}.
 */
export const UserSettingsSchema = z.object({
  isAnalyticsEnabled: z.boolean(),
  isCrashReportingEnabled: z.boolean(),
  pushNotificationTriggerIds: z.array(PushNotificationTriggerIDSchema),
  canShareArrivalStatus: z.boolean(),
  eventCalendarStartOfWeekDay: EventCalendarWeekdaySchema,
  eventCalendarDefaultLayout: EventCalendarLayoutIDSchema,
  eventPresetShouldHideAfterStartDate: z.boolean(),
  eventPresetPlacemark: EventEditLocationSchema.optional(),
  eventPresetDurations: z.array(z.number()),
  version: UserSettingsVersionSchema
})

/**
 * A type representing a user's settings.
 *
 * Each instance of settings has a version number which is used for client
 * and server side synchronization. When the client refreshes its settings,
 * it compares its local version number with the version number of the server.
 * If the server version number is higher than the client version number, then
 * the client switches to using the server version number. If the client
 * version number is higher than the server's, then the client sends its copy
 * of the settings to the server.
 */
export type UserSettings = z.rInfer<typeof UserSettingsSchema>

/**
 * The default user settings which enables all fields, and sets the version
 * number to zero.
 */
export const DEFAULT_USER_SETTINGS = {
  isAnalyticsEnabled: true,
  isCrashReportingEnabled: true,
  pushNotificationTriggerIds: [
    "friend-request-received",
    "friend-request-accepted",
    "user-entered-region",
    "event-attendance-headcount",
    "event-periodic-arrivals",
    "event-starting-soon",
    "event-started",
    "event-ended",
    "event-name-changed",
    "event-description-changed",
    "event-time-changed",
    "event-location-changed",
    "event-cancelled"
  ],
  canShareArrivalStatus: true,
  eventCalendarStartOfWeekDay: "monday",
  eventCalendarDefaultLayout: "week-layout",
  eventPresetDurations: [900, 1800, 2700, 3600, 5400],
  eventPresetPlacemark: undefined,
  eventPresetShouldHideAfterStartDate: false,
  version: 0
} satisfies Readonly<UserSettings>
