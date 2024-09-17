import { ColorString } from "../../domain-models/ColorString"
import { dateRange } from "../../domain-models/FixedDateRange"
import { UserHandle } from "../../domain-models/User"
import { EventResponse, EventResponseSchema } from "./Event"

describe("EventAPIModels tests", () => {
  test("event response schema", () => {
    const json = {
      id: 19891,
      title: "test event",
      description: "Southern tuco-tuco",
      attendeeCount: 1,
      color: "#72B01D",
      time: {
        secondsToStart: 43194.886,
        dateRange: {
          startDateTime: "2024-03-25T19:54:25.000Z",
          endDateTime: "2025-03-25T07:54:25.000Z"
        },
        todayOrTomorrow: "today"
      },
      previewAttendees: [
        {
          id: "2fd22e4a-147c-4189-889e-15469b80eaf7",
          profileImageURL: null
        }
      ],
      location: {
        coordinate: { latitude: 36.98, longitude: -122.06 },
        placemark: {
          name: "115 Tosca Ter, Santa Cruz, CA 95060-2352, United States",
          postalCode: "95060-2352",
          street: "Tosca Ter",
          streetNumber: "115",
          isoCountryCode: "USA",
          city: "Westside"
        },
        timezoneIdentifier: "America/Los_Angeles",
        arrivalRadiusMeters: 120,
        isInArrivalTrackingPeriod: true
      },
      host: {
        relations: { fromThemToYou: "not-friends", fromYouToThem: "not-friends" },
        id: "2fd22e4a-147c-4189-889e-15469b80eaf7",
        username: "Caroline Parisian",
        handle: "carolinepar0103",
        profileImageURL: null
      },
      settings: { shouldHideAfterStartDate: true, isChatEnabled: true },
      userAttendeeStatus: "not-participating",
      joinDate: null,
      isChatExpired: false,
      hasArrived: false,
      updateDateTime: "2024-03-25T07:54:28.000Z",
      createdDateTime: "2024-03-25T07:54:28.000Z",
      endedAt: null
    }
    const result = EventResponseSchema.safeParse(json) as {
      data: EventResponse
    }
    expect(result.data).toEqual({
      id: 19891,
      title: "test event",
      description: "Southern tuco-tuco",
      attendeeCount: 1,
      color: ColorString.parse("#72B01D")!,
      time: {
        secondsToStart: 43194.886,
        dateRange: dateRange(
          new Date("2024-03-25T19:54:25.000Z"),
          new Date("2025-03-25T07:54:25.000Z")
        )!,
        todayOrTomorrow: "today"
      },
      previewAttendees: [
        {
          id: "2fd22e4a-147c-4189-889e-15469b80eaf7",
          profileImageURL: null
        }
      ],
      location: {
        coordinate: { latitude: 36.98, longitude: -122.06 },
        placemark: {
          name: "115 Tosca Ter, Santa Cruz, CA 95060-2352, United States",
          postalCode: "95060-2352",
          street: "Tosca Ter",
          streetNumber: "115",
          isoCountryCode: "USA",
          city: "Westside"
        },
        timezoneIdentifier: "America/Los_Angeles",
        arrivalRadiusMeters: 120,
        isInArrivalTrackingPeriod: true
      },
      host: {
        relations: { fromThemToYou: "not-friends", fromYouToThem: "not-friends" },
        id: "2fd22e4a-147c-4189-889e-15469b80eaf7",
        username: "Caroline Parisian",
        handle: UserHandle.optionalParse("carolinepar0103")!,
        profileImageURL: null
      },
      settings: { shouldHideAfterStartDate: true, isChatEnabled: true },
      userAttendeeStatus: "not-participating",
      joinDate: null,
      isChatExpired: false,
      hasArrived: false,
      updateDateTime: new Date("2024-03-25T07:54:28.000Z"),
      createdDateTime: new Date("2024-03-25T07:54:28.000Z"),
      endedAt: null
    })
  })
})
