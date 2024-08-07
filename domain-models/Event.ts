import { Match } from "linkify-it"
import { z } from "zod"
import {
  ensureWhitespaceBeforeSchemaValidator,
  linkify
} from "../lib/LinkifyIt"
import { Tagged } from "../lib/Types/HelperTypes"
import { ColorString } from "./ColorString"
import {
  LocationCoordinate2DSchema,
  areCoordinatesEqual
} from "./LocationCoordinate2D"
import { PlacemarkSchema } from "./Placemark"
import {
  BlockedBidirectionalUserRelationsSchema,
  UnblockedBidirectionalUserRelationsSchema,
  UserHandleSchema,
  UserIDSchema
} from "./User"

export type EventID = Tagged<number, "eventId">

export const EventIDSchema = z.number().transform((id) => id as EventID)

/**
 * A zod schema for {@link EventRegion}.
 */
export const EventRegionSchema = z.object({
  coordinate: LocationCoordinate2DSchema,
  arrivalRadiusMeters: z.number()
})

/**
 * An event region is defined by the precise location coordinate of an event, and its arrival radius.
 */
export type EventRegion = z.rInfer<typeof EventRegionSchema>

/**
 * Returns true if 2 {@link EventRegion}s are equal.
 */
export const areEventRegionsEqual = (r1: EventRegion, r2: EventRegion) => {
  return (
    areCoordinatesEqual(r1.coordinate, r2.coordinate) &&
    r1.arrivalRadiusMeters === r2.arrivalRadiusMeters
  )
}

export const EventAttendeeSchema = z.object({
  id: UserIDSchema,
  username: z.string(),
  handle: UserHandleSchema,
  profileImageURL: z.string().url().nullable(),
  relations: UnblockedBidirectionalUserRelationsSchema
})

/**
 * User information given for an attendee of an event.
 */
export type EventAttendee = z.rInfer<typeof EventAttendeeSchema>

export const EventWhenBlockedByHostAttendeeSchema = EventAttendeeSchema.omit({
  relations: true
}).extend({ relations: BlockedBidirectionalUserRelationsSchema })

export type EventWhenBlockedByHostAttendee = z.rInfer<
  typeof EventWhenBlockedByHostAttendeeSchema
>

/**
 * A zod schema for an event attendees list page fetched from the server.
 */
export const EventAttendeesPageSchema = z.object({
  attendees: z.array(EventAttendeeSchema),
  totalAttendeeCount: z.number(),
  nextPageCursor: z.string().nullable()
})

export const EventSettingsSchema = z.object({
  shouldHideAfterStartDate: z.boolean(),
  isChatEnabled: z.boolean()
})

/**
 * Specific tunable values that a host can impose on an event.
 */
export type EventSettings = z.rInfer<typeof EventSettingsSchema>

export const EventUserAttendeeStatusSchema = z.union([
  z.literal("not-participating"),
  z.literal("hosting"),
  z.literal("attending")
])

/**
 * Returns true if the status indicates that the user is hosting the event.
 */
export const isHostingEvent = (attendeeStatus: EventUserAttendeeStatus) => {
  return attendeeStatus === "hosting"
}

/**
 * Returns true if the status indicates that the user is either hosting or
 * attending the event.
 */
export const isAttendingEvent = (attendeeStatus: EventUserAttendeeStatus) => {
  return attendeeStatus !== "not-participating"
}

/**
 * A status for telling whether or not the user is attending, hosting, or not participating in an event.
 */
export type EventUserAttendeeStatus = z.rInfer<
  typeof EventUserAttendeeStatusSchema
>

export const EventWhenBlockedByHostSchema = z.object({
  id: EventIDSchema,
  title: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  host: EventWhenBlockedByHostAttendeeSchema
})

export type EventWhenBlockedByHost = z.rInfer<
  typeof EventWhenBlockedByHostSchema
>

export const EventPreviewAttendeeSchema = EventAttendeeSchema.pick({
  id: true,
  profileImageURL: true
})

/**
 * Quick and simple information needed to show profile images of an event attendee.
 */
export type EventPreviewAttendee = Pick<EventAttendee, "id" | "profileImageURL">

export const EventLocationSchema = EventRegionSchema.extend({
  isInArrivalTrackingPeriod: z.boolean(),
  timezoneIdentifier: z.string(),
  placemark: PlacemarkSchema.nullable()
})

/**
 * Information for the location of an event.
 *
 * This type includes the properties of an {@link EventRegion}, and
 * additionally adds an optional placemark property which can be undefined if
 * the `coordinate` has not yet been geocoded on the backend.
 *
 * Additionally, since arrival tracking is tied to regions rather than events,
 * `isInArrivalTrackingPeriod` is contained on this type rather than
 * {@link CurrentUserEvent}. Whilst arrival statuses are only displayed within
 * 1 hour of the event starting, `isInArrivalTrackingPeriod` determines whether
 * or not the event is in the 24 hour period where we can add it to
 * {@link EventArrivalsTracker}. The 24 hour period covers the 24 hours prior
 * to the event starting.
 */
export type EventLocation = z.rInfer<typeof EventLocationSchema>

export const EventArrivalRegionSchema = EventRegionSchema.extend({
  eventIds: z.array(EventIDSchema),
  hasArrived: z.boolean()
})

/**
 * A type containing the same properties as {@link EventRegion}, but also
 * with a status of whether or not the user has arrived at the region.
 *
 * Since multiple events can be at the same region, this type also contains
 * all the ids of the events which share this region.
 */
export type EventArrivalRegion = z.rInfer<typeof EventArrivalRegionSchema>

export const TrackableEventArrivalRegionsSchema = z.object({
  trackableRegions: z.array(EventArrivalRegionSchema)
})

/**
 * A type containing the regions that the client should track for arrival.
 */
export type TrackableEventArrivalRegions = z.rInfer<
  typeof TrackableEventArrivalRegionsSchema
>

/**
 * A handle that users can reference other events with.
 *
 * Event handles are not visible to users, rather they are an internal detail
 * that allow users to reference events easily. A raw form of the handle is
 * embedded in text like bios, chat messages, etc. that takes the form:
 *
 * `"!<event-name-length>|<event-id>/<event-color>/<event-name>"`
 *
 * This form is not visible to the user, but rather just the event name is shown in
 * the resulting text to the user.
 */
export class EventHandle {
  static readonly LINKIFY_SCHEMA = "!"

  readonly eventId: number
  readonly eventName: string
  readonly color: ColorString

  constructor(eventId: number, eventName: string, color: ColorString) {
    this.eventId = eventId
    this.eventName = eventName
    this.color = color
  }

  /**
   * Formats this event handle back to its raw form.
   */
  toString() {
    return `!${this.eventName.length}|${this.eventId}/${this.color}/${this.eventName}`
  }

  /**
   * Attempts to parse an {@link EventHandle} from a raw string.
   *
   * A valid event handle takes the form `"<event-name-length>|<event-id>/<event-color>/<event-name>"`
   * (note the omitted `"!"` at the start).
   *
   * @param rawValue the raw string to attempt to parse.
   * @param startPosition the position of the string to begin parsing at (defaults to 0).
   * @returns an {@link EventHandle} instance if valid.
   */
  static parse(rawValue: string, startPosition: number = 0) {
    const lengthSeparatorIndex = rawValue.indexOf("|", startPosition)
    if (lengthSeparatorIndex === -1) return undefined

    const firstSlashIndex = rawValue.indexOf("/", lengthSeparatorIndex)
    if (firstSlashIndex === -1) return undefined

    const secondSlashIndex = rawValue.indexOf("/", firstSlashIndex + 1)
    if (secondSlashIndex === -1) return undefined

    const eventId = parseInt(
      rawValue.substring(lengthSeparatorIndex + 1, firstSlashIndex)
    )
    if (Number.isNaN(eventId)) return undefined

    const color = ColorString.parse(
      rawValue.substring(firstSlashIndex + 1, secondSlashIndex)
    )
    if (!color) return undefined

    const nameLength = parseInt(
      rawValue.substring(startPosition, lengthSeparatorIndex)
    )
    if (Number.isNaN(nameLength)) return undefined

    return new EventHandle(
      eventId,
      rawValue.substring(
        secondSlashIndex + 1,
        secondSlashIndex + 1 + nameLength
      ),
      color
    )
  }
}

export type EventHandleLinkifyMatch = Match & { eventHandle: EventHandle }

let _linkifyParsedHandle: EventHandle | undefined
linkify.add(EventHandle.LINKIFY_SCHEMA, {
  validate: ensureWhitespaceBeforeSchemaValidator((text, pos) => {
    _linkifyParsedHandle = EventHandle.parse(text, pos)
    return _linkifyParsedHandle
  }),
  normalize: (match: EventHandleLinkifyMatch) => {
    // NB: We shouldn't get past validate if the parsed handle is undefined.
    match.eventHandle = _linkifyParsedHandle!
  }
})
