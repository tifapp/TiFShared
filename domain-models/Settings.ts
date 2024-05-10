import { z } from "zod"
import { PlacemarkSchema } from "./Placemark"

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

export type EventDurationSeconds = number

/**
 * A zod schema for {@link UserSettingsSchema}.
 */
export const UserSettingsSchema = z.object({
  isAnalyticsEnabled: z.boolean(),
  isCrashReportingEnabled: z.boolean(),
  isEventNotificationsEnabled: z.boolean(),
  isMentionsNotificationsEnabled: z.boolean(),
  isChatNotificationsEnabled: z.boolean(),
  isFriendRequestNotificationsEnabled: z.boolean(),
  canShareArrivalStatus: z.boolean(),
  fontFamily: CustomizeableFontFamilySchema,
  userInterfaceStyle: UserInterfaceStyleSchema,
  eventCalendarStartOfWeekDay: EventCalendarWeekdaySchema,
  eventCalendarDefaultLayout: EventCalendarLayoutSchema,
  eventPresetShouldHideAfterStartDate: z.boolean(),
  eventPresetPlacemark: PlacemarkSchema,
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
  isEventNotificationsEnabled: true,
  isMentionsNotificationsEnabled: true,
  isChatNotificationsEnabled: true,
  isFriendRequestNotificationsEnabled: true,
  canShareArrivalStatus: true,
  fontFamily: "open-sans",
  userInterfaceStyle: "system",
  eventCalendarStartOfWeekDay: "monday",
  eventCalendarDefaultLayout: "week-layout",
  version: 0
} satisfies Readonly<UserSettings>
