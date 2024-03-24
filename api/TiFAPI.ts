import {
  UserHandle,
  UserHandleSchema,
  UserID,
  UserIDSchema
} from "../domain-models/User"
import {
  EventAttendeesPageSchema,
  EventRegion,
  TrackableEventArrivalRegionsSchema
} from "../domain-models/Event"
import { z } from "zod"
import { TiFAPIEndpoint, TiFAPITransport } from "./Transport"
import {
  UpdateCurrentUserProfileRequest,
  UserNotFoundResponseSchema,
  userTiFAPIErrorSchema
} from "./models/User"
import { tifAPIErrorSchema } from "./models/Error"
import {
  EventNotFoundErrorSchema,
  EventResponseSchema,
  EventWhenBlockedByHostResponseSchema,
  JoinEventResponseSchema
} from "./models/Event"

/**
 * A high-level client for the TiF API.
 *
 * This class provides wrapper functions which use the lower level {@link TiFAPIFetch}
 * function. The lower level function automatically tracks the current user's session
 * and handles authorization headers as well as response parsing.
 */
export class TiFAPI {
  static readonly TEST_URL = new URL("https://localhost:8080")

  static testPath(endpoint: TiFAPIEndpoint) {
    return `${TiFAPI.TEST_URL}${endpoint.slice(1)}`
  }
  private readonly apiFetch: TiFAPITransport

  constructor(apiFetch: TiFAPITransport) {
    this.apiFetch = apiFetch
  }

  /**
   * Creates the user's TiF profile after they have fully signed up and verified their account.
   *
   * @returns an object containing the user's id and generated user handle.
   */
  async createCurrentUserProfile() {
    return await this.apiFetch(
      { method: "POST", endpoint: "/user" },
      {
        status201: z.object({
          id: UserIDSchema,
          handle: UserHandleSchema
        })
      }
    )
  }

  /**
   * Updates the current user's profile attributes.
   */
  async updateCurrentUserProfile(request: UpdateCurrentUserProfileRequest) {
    return await this.apiFetch(
      {
        method: "PATCH",
        endpoint: "/user/self",
        body: request
      },
      {
        status204: "no-content"
      }
    )
  }

  /**
   * Given a partial handle, returns a list of autocompleted users with a similar handle.
   *
   * @param handle a handle string.
   * @param limit the maximum amount of users to return.
   * @param signal an {@link AbortSignal} to cancel the query.
   * @returns an object with a list of users containing their name, handle, and id.
   */
  async autocompleteUsers(handle: string, limit: number, signal?: AbortSignal) {
    return await this.apiFetch(
      {
        method: "GET",
        endpoint: "/user/autocomplete",
        query: { handle, limit }
      },
      {
        status200: z.object({
          users: z.array(
            z.object({
              id: UserIDSchema,
              name: z.string(),
              handle: UserHandleSchema
            })
          )
        })
      },
      signal
    )
  }

  /**
   * Indicates that the user has arrived at the given region.
   *
   * @returns a list of regions of the user's upcoming events.
   */
  async arriveAtRegion(region: EventRegion) {
    return await this.apiFetch(
      {
        method: "POST",
        endpoint: "/event/arrived",
        body: region
      },
      {
        status200: TrackableEventArrivalRegionsSchema
      }
    )
  }

  /**
   * Indicates that the user has departed from the given region.
   *
   * @returns a list of regions of the user's upcoming events.
   */
  async departFromRegion(region: EventRegion) {
    return await this.apiFetch(
      {
        method: "POST",
        endpoint: "/event/departed",
        body: region
      },
      {
        status200: TrackableEventArrivalRegionsSchema
      }
    )
  }

  /**
   * Fetches all upcoming event arrival regions.
   *
   * The regions include ids of events that are either ongoing, or
   * start within the next 24 hours.
   *
   * @returns a list of regions of the user's upcoming events.
   */
  async upcomingEventArrivalRegions() {
    return await this.apiFetch(
      {
        method: "GET",
        endpoint: "/event/upcoming"
      },
      { status200: TrackableEventArrivalRegionsSchema }
    )
  }

  /**
   * Loads an individual event by its id.
   */
  async eventDetails(eventId: number) {
    return await this.apiFetch(
      {
        method: "GET",
        endpoint: `/event/details/${eventId}`
      },
      {
        status200: EventResponseSchema.refine((resp) => resp.id === eventId),
        status204: "no-content",
        status404: EventNotFoundErrorSchema,
        status403: EventWhenBlockedByHostResponseSchema.refine(
          (resp) => resp.id === eventId
        )
      }
    )
  }

  async attendeesList(eventId: number, limit: number, nextPage?: string) {
    return await this.apiFetch(
      {
        method: "GET",
        endpoint: `/event/attendees/${eventId}`,
        query: { limit, nextPage }
      },
      {
        status200: EventAttendeesPageSchema,
        status204: "no-content",
        status404: EventNotFoundErrorSchema,
        status403: tifAPIErrorSchema("blocked-by-host")
      }
    )
  }

  /**
   * Joins the event with the given id.
   *
   * @param eventId The id of the event to join.
   * @param arrivalRegion A region to pass for marking an initial arrival if the user has arrived in the area of the event.
   * @returns The upcoming event arrivals based on the user joining this event, and a token request for the event group chat.
   */
  async joinEvent(eventId: number, arrivalRegion: EventRegion | null) {
    const body = arrivalRegion ? { region: arrivalRegion } : undefined
    return await this.apiFetch(
      {
        method: "POST",
        endpoint: `/event/join/${eventId}`,
        body
      },
      {
        status403: tifAPIErrorSchema(
          "event-has-ended",
          "event-was-cancelled",
          "user-is-blocked"
        ),
        status201: JoinEventResponseSchema.refine(
          (resp) => resp.id === eventId
        ),
        status200: JoinEventResponseSchema.refine((resp) => resp.id === eventId)
      }
    )
  }

  /**
   * Leaves the event with the given id.
   *
   * @param eventId The id of the event to leave.
   */
  async leaveEvent(eventId: number) {
    return await this.apiFetch(
      {
        method: "POST",
        endpoint: `/event/leave/${eventId}`
      },
      {
        status403: tifAPIErrorSchema(
          "event-has-been-cancelled",
          "event-has-ended"
        ),
        status400: tifAPIErrorSchema("co-host-not-found", "already-left-event"),
        status204: "no-content"
      }
    )
  }

  /**
   * Registers for the user for push notifications given a push token and a
   * platform name.
   */
  async registerForPushNotifications(
    pushToken: string,
    platformName: "apple" | "android"
  ) {
    return await this.apiFetch(
      {
        method: "POST",
        endpoint: "/user/notifications/push/register",
        body: { pushToken, platformName }
      },
      {
        status201: z.object({ status: z.literal("inserted") }),
        status400: tifAPIErrorSchema("token-already-registered")
      }
    )
  }

  /**
   * Blocks a user.
   *
   * Blocks can be mutual (ie. 2 users can block each other regardless of if
   * they have been blocked by the user they are trying to block), so this
   * endpoint only fails if the given user id does not exist.
   */
  async blockUser(id: UserID) {
    return await this.apiFetch(
      {
        method: "PATCH",
        endpoint: `/user/block/${id}`
      },
      {
        status204: "no-content",
        status404: UserNotFoundResponseSchema
      }
    )
  }

  /**
   * Unblocks a user.
   *
   * Blocks can be mutual (ie. 2 users can block each other regardless of if
   * they have been blocked by the user they are trying to block), so this
   * endpoint only fails if the given user id does not exist or if the user
   * is not blocked in the first place.
   */
  async unblockUser(id: UserID) {
    return await this.apiFetch(
      {
        method: "DELETE",
        endpoint: `/user/block/${id}`
      },
      {
        status204: "no-content",
        status404: UserNotFoundResponseSchema,
        status403: userTiFAPIErrorSchema("user-not-blocked")
      }
    )
  }
}