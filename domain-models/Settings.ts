import { z } from "zod"

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

export type EventCalendarWeekday = z.infer<typeof EventCalendarWeekdaySchema>

export const EventCalendarLayoutSchema = z.union([
  z.literal("single-day-layout"),
  z.literal("week-layout"),
  z.literal("month-layout")
])

export type EventCalendarLayout = z.infer<typeof EventCalendarLayoutSchema>

export const UserInterfaceStyleSchema = z.union([
  z.literal("light"),
  z.literal("dark"),
  z.literal("system")
])

export type UserInterfaceStyle = z.infer<typeof UserInterfaceStyleSchema>

export const CustomizeableFontFamilySchema = z.union([
  z.literal("open-sans"),
  z.literal("open-dyslexic")
])

export type CustomizeableFontFamily = z.infer<
  typeof CustomizeableFontFamilySchema
>

export const EventChangeNotificationTriggerSchema = z.union([
  z.literal("name-changed"),
  z.literal("description-changed"),
  z.literal("time-changed"),
  z.literal("location-changed"),
  z.literal("event-cancelled")
])

/**
 * A string descriptor for a trigger when a push notification should be sent to
 * the user due to information about an event changing or being cancelled.
 *
 * `"name-changed"` -> Triggers when the event name changes.
 *
 * `"description-changed"` -> Triggers when the event description changes.
 *
 * `"time-changed"` -> Triggers when either the start time or duration of the
 * event changes.
 *
 * `"location-changed"` -> Triggers when the event location changes.
 *
 * `"event-cancelled"` -> Triggers when the event is cancelled.
 */
export type EventChangeNotificationTrigger = z.infer<
  typeof EventChangeNotificationTriggerSchema
>

export const EventTimeNotificationTriggerSchema = z.union([
  z.literal("before-event"),
  z.literal("event-started"),
  z.literal("event-ended")
])

/**
 * A string descriptor for a trigger when a push notification should be sent to
 * the user due to the timing of the event.
 *
 * `"before-event"` -> Triggers x minutes (user-specified) before the event starts.
 *
 * `"event-started"` -> Triggers when the event starts.
 *
 * `"event-ended"` -> Triggers when the event ends.
 */
export type EventTimeNotificationTrigger = z.infer<
  typeof EventTimeNotificationTriggerSchema
>

export const FriendNotificationTriggerSchema = z.union([
  z.literal("friend-request-received"),
  z.literal("friend-request-accepted")
])

/**
 * A string descriptor for a trigger when a push notification should be sent to
 * the user due to actions taken by sending friend requests.
 *
 * `"friend-request-received"` -> Triggers when the user received a friend
 * request from another user.
 *
 * `"friend-request-accepted"` -> Triggers when another user accpets the user's
 * friend request.
 */
export type FriendNotificationTrigger = z.infer<
  typeof FriendNotificationTriggerSchema
>

export const EventArrivalNotificationTriggerSchema = z.union([
  z.literal("user-entered-region"),
  z.literal("event-started"),
  z.literal("event-periodic-update")
])

/**
 * A string descriptor for a trigger when a push notification should be sent to
 * the user due to event participants arriving at their respective event.
 *
 * `"user-entered-region"` -> Triggers when the user enters the arrival radius
 * for the event within the tracking period.
 *
 * `"event-started"` -> Triggers when an event starts.
 *
 * `"event-periodic-update"` -> Triggers at periodic intervals throughout the
 * duration of an event.
 */
export type EventArrivalNotificationTrigger = z.infer<
  typeof EventArrivalNotificationTriggerSchema
>

/**
 * A zod schema for {@link UserSettingsSchema}.
 */
export const UserSettingsSchema = z.object({
  isAnalyticsEnabled: z.boolean(),
  isCrashReportingEnabled: z.boolean(),
  isEventNotificationsEnabled: z.boolean(),
  isMentionsNotificationsEnabled: z.boolean(),
  isChatNotificationsEnabled: z.boolean(),
  isProfileNotificationsEnabled: z.boolean(),
  eventArrivalNotificationTriggers: z.array(
    EventArrivalNotificationTriggerSchema
  ),
  eventChangeNotificationTriggers: z.array(
    EventChangeNotificationTriggerSchema
  ),
  eventTimeNotificationTriggers: z.array(EventTimeNotificationTriggerSchema),
  friendNotificationTriggers: z.array(FriendNotificationTriggerSchema),
  canShareArrivalStatus: z.boolean(),
  fontFamily: CustomizeableFontFamilySchema,
  userInterfaceStyle: UserInterfaceStyleSchema,
  eventCalendarStartOfWeekDay: EventCalendarWeekdaySchema,
  eventCalendarDefaultLayout: EventCalendarLayoutSchema,
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
  isEventNotificationsEnabled: true,
  isMentionsNotificationsEnabled: true,
  isChatNotificationsEnabled: true,
  isProfileNotificationsEnabled: true,
  eventChangeNotificationTriggers: [
    "time-changed",
    "event-cancelled",
    "location-changed"
  ],
  eventArrivalNotificationTriggers: [
    "event-started",
    "event-periodic-update",
    "user-entered-region"
  ],
  eventTimeNotificationTriggers: ["before-event", "event-started"],
  friendNotificationTriggers: [
    "friend-request-received",
    "friend-request-accepted"
  ],
  canShareArrivalStatus: true,
  fontFamily: "open-sans",
  userInterfaceStyle: "system",
  eventCalendarStartOfWeekDay: "monday",
  eventCalendarDefaultLayout: "week-layout",
  version: 0
} satisfies Readonly<UserSettings>
