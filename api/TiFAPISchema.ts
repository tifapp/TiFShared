import { z } from "zod"
import {
  EventAttendeesPageSchema,
  EventEditSchema,
  EventIDSchema,
  EventRegionSchema,
  EventWhenBlockedByHostSchema,
  TrackableEventArrivalRegionsSchema
} from "../domain-models/Event"
import { LocationCoordinate2DSchema } from "../domain-models/LocationCoordinate2D"
import {
  BlockedYouStatusSchema,
  UserHandleSchema,
  UserIDSchema,
  UserProfileSchema
} from "../domain-models/User"
import {
  APISchema,
  EndpointSchemasToFunctions,
  StatusCodes,
  endpointSchema
} from "./TransportTypes"
import { tifAPIErrorSchema } from "./models/Error"
import {
  EventNotFoundErrorSchema,
  EventResponseSchema,
  EventsTimelineResponseSchema,
  EventsInAreaResponseSchema,
  EventsResponseSchema,
  JoinEventResponseSchema,
  EventsTimelinePageTokenSchema,
  EventsTimelineDirectionSchema
} from "./models/Event"
import {
  RegisterPushTokenRequestSchema,
  SelfProfileSchema,
  UpdateCurrentUserProfileRequestSchema,
  UpdateUserSettingsRequestSchema,
  UserFriendRequestResponseSchema,
  UserNotFoundResponseSchema,
  UserSettingsResponseSchema,
  userTiFAPIErrorSchema
} from "./models/User"
import { UpcomingEventsFixedDateRangeSchema } from "./models/FixedDateRange"

export const TiFAPISchema = {
  /**
   * Creates the user's TiF profile after they have fully signed up and verified their account.
   *
   * @returns an object containing the user's id and generated user handle.
   */
  createCurrentUserProfile: endpointSchema({
    input: {
      body: z.object({ name: z.string() })
    },
    outputs: {
      status201: z.object({
        id: UserIDSchema,
        handle: UserHandleSchema,
        name: z.string(),
        token: z.string()
      }),
      status400: tifAPIErrorSchema("invalid-name")
    },
    httpRequest: {
      method: "POST",
      endpoint: "/user"
    }
  }),

  /**
   * Updates the current user's profile attributes.
   */
  updateCurrentUserProfile: endpointSchema({
    input: {
      body: UpdateCurrentUserProfileRequestSchema
    },
    outputs: {
      status204: "no-content"
    },
    httpRequest: {
      method: "PATCH",
      endpoint: "/user/self"
    }
  }),

  /**
   * Given a partial handle, returns a list of autocompleted users with a similar handle.
   *
   * @param handle a handle string.
   * @param limit the maximum amount of users to return.
   * @param signal an {@link AbortSignal} to cancel the query.
   * @returns an object with a list of users containing their name, handle, and id.
   */
  autocompleteUsers: endpointSchema({
    input: {
      query: z.object({
        handle: UserHandleSchema,
        limit: z.coerce.number().min(1).max(50)
      })
    },
    outputs: {
      status200: z.object({
        users: z.array(
          z.object({
            id: UserIDSchema,
            name: z.string().min(1).max(300),
            handle: UserHandleSchema
          })
        )
      })
    },
    httpRequest: {
      method: "GET",
      endpoint: "/user/autocomplete"
    }
  }),

  /**
   * Indicates that the user has arrived at the given region.
   *
   * @returns a list of regions of the user's upcoming events.
   */
  updateArrivalStatus: endpointSchema({
    input: {
      body: EventRegionSchema.extend({
        status: z.enum(["arrived", "departed"])
      })
    },
    outputs: {
      status200: TrackableEventArrivalRegionsSchema
    },
    httpRequest: {
      method: "POST",
      endpoint: "/event/arrival/status"
    }
  }),

  /**
   * Fetches all upcoming event arrival regions.
   *
   * The regions include ids of events that are either ongoing, or
   * start within the next 24 hours.
   *
   * @returns a list of regions of the user's upcoming events.
   */
  upcomingEventArrivalRegions: endpointSchema({
    input: {},
    outputs: {
      status200: TrackableEventArrivalRegionsSchema
    },
    httpRequest: {
      method: "GET",
      endpoint: "/event/upcoming"
    }
  }),

  /**
   * Loads an individual event by its id.
   */
  eventDetails: endpointSchema({
    input: {
      params: z.object({
        eventId: EventIDSchema
      })
    },
    outputs: {
      status200: EventResponseSchema,
      status404: EventNotFoundErrorSchema,
      status403: EventWhenBlockedByHostSchema
    },
    constraints: (input, output) => {
      if (output.status === 200 || output.status === 403) {
        return output.data.id === input.params.eventId
      }

      return true
    },
    httpRequest: {
      method: "GET",
      endpoint: `/event/details/:eventId`
    }
  }),

  /**
   * Fetches a paginated list of attendees for a given event.
   *
   * @param eventId The id of the event to check.
   * @param limit the maximum amount of users to return.
   * @param nextPage points to a particular section in the attendees list
   */
  attendeesList: endpointSchema({
    input: {
      params: z.object({
        eventId: EventIDSchema
      }),
      query: z.object({
        limit: z.coerce.number().min(1).max(50),
        nextPageCursor: z.string().optional()
      })
    },
    outputs: {
      status200: EventAttendeesPageSchema,
      status404: tifAPIErrorSchema("no-attendees", "event-not-found"),
      status403: tifAPIErrorSchema(BlockedYouStatusSchema.value)
    },
    httpRequest: {
      method: "GET",
      endpoint: `/event/attendees/:eventId`
    }
  }),

  /**
   * Joins the event with the given id.
   *
   * @param eventId The id of the event to join.
   * @param arrivalRegion A region to pass for marking an initial arrival if the user has arrived in the area of the event.
   * @returns The upcoming event arrivals based on the user joining this event, and a token request for the event group chat.
   */
  endEvent: endpointSchema({
    input: {
      params: z.object({
        eventId: EventIDSchema
      })
    },
    outputs: {
      status404: tifAPIErrorSchema("event-not-found"),
      status403: tifAPIErrorSchema("event-has-ended", "user-not-host"),
      status204: "no-content"
    },
    httpRequest: {
      method: "POST",
      endpoint: `/event/end/:eventId`
    }
  }),

  /**
   * Creates an event.
   */
  createEvent: endpointSchema({
    input: { body: EventEditSchema },
    outputs: { status201: EventResponseSchema },
    httpRequest: {
      method: "POST",
      endpoint: `/event`
    }
  }),

  /**
   * Edits an event.
   */
  editEvent: endpointSchema({
    input: {
      params: z.object({
        eventId: EventIDSchema
      }),
      body: EventEditSchema
    },
    outputs: {
      status200: EventResponseSchema,
      status404: tifAPIErrorSchema("event-not-found"),
      status403: tifAPIErrorSchema(
        "user-not-host",
        "event-has-ended",
        "blocked-you"
      )
    },
    httpRequest: {
      method: "PATCH",
      endpoint: `/event/:eventId`
    }
  }),

  /**
   * Joins the event with the given id.
   *
   * @param eventId The id of the event to join.
   * @param arrivalRegion A region to pass for marking an initial arrival if the user has arrived in the area of the event.
   * @returns The upcoming event arrivals based on the user joining this event, and a token request for the event group chat.
   */
  joinEvent: endpointSchema({
    input: {
      params: z.object({
        eventId: EventIDSchema
      }),
      body: z
        .object({
          region: EventRegionSchema
        })
        .optional()
    },
    outputs: {
      status404: tifAPIErrorSchema("event-not-found"),
      status403: tifAPIErrorSchema(
        "event-has-ended",
        "blocked-you",
        "event-was-cancelled"
      ),
      status201: JoinEventResponseSchema,
      status200: JoinEventResponseSchema
    },
    constraints: (input, output) => {
      if (output.status === 200 || output.status === 201) {
        return output.data.id === input.params.eventId
      }

      return true
    },
    httpRequest: {
      method: "POST",
      endpoint: `/event/join/:eventId`
    }
  }),

  /**
   * Leaves the event with the given id.
   *
   * @param eventId The id of the event to leave.
   */
  leaveEvent: endpointSchema({
    input: {
      params: z.object({
        eventId: EventIDSchema
      })
    },
    outputs: {
      status403: tifAPIErrorSchema("event-was-cancelled", "event-has-ended"),
      status404: tifAPIErrorSchema("event-not-found"),
      status200: z.object({ message: z.literal("not-attending") }),
      status204: "no-content"
    },
    httpRequest: {
      method: "POST",
      endpoint: `/event/leave/:eventId`
    }
  }),

  /**
   * Returns the upcoming events of a user.
   */
  upcomingEvents: endpointSchema({
    input: {
      query: z.object({
        userId: UserIDSchema,
        maxSecondsToStart: z.coerce.number().optional(),
        dateRange: UpcomingEventsFixedDateRangeSchema.optional()
      })
    },
    outputs: {
      status200: EventsResponseSchema,
      status403: userTiFAPIErrorSchema("blocked-you"),
      status404: UserNotFoundResponseSchema
    },
    httpRequest: {
      method: "GET",
      endpoint: `/event/upcomingEvents`
    }
  }),

  /**
   * Returns the user's events timeline.
   *
   * You pass the direction and the number of events you want to fetch from the timeline as query
   * parameters. When fetching in the backwards direction, ongoing events are included, but no
   * ongoing events are included when fetching forwards.
   *
   * The first request will divide the `limit` parameter, and fetch half the limit in the forwards
   * direction, and half the limit in the backwards direction.
   *
   * After the first request, the endpoint will respond with a `nextToken` field. Include this
   * token as a query parameter on all subsequent requests to this endpoint in order to get the
   * most up to date events (regardless of direction).
   *
   * To check if there are no more pages to fetch in a specific direction, each response includes
   * a `hasNextForwardPage` and `hasNextBackwardPage` fields that indicates whether or not you can
   * fetch another page in the direction you passed to the request.
   *
   * The client is responsible for handling duplicate events returned on different pages. This is
   * to ensure that we display up to date data as much as possible in the UI.
   */
  timeline: endpointSchema({
    input: {
      query: z.object({
        limit: z.coerce.number(),
        direction: EventsTimelineDirectionSchema,
        token: z.base64URLDecodedJSON(EventsTimelinePageTokenSchema).optional()
      })
    },
    outputs: {
      status200: EventsTimelineResponseSchema
    },
    httpRequest: {
      method: "GET",
      endpoint: `/event/timeline`
    }
  }),

  /**
   * Registers for the user for push notifications given a push token and a
   * platform name.
   */
  registerForPushNotifications: endpointSchema({
    input: {
      body: RegisterPushTokenRequestSchema
    },
    outputs: {
      status201: z.object({ status: z.literal("inserted") }),
      status400: tifAPIErrorSchema("token-already-registered")
    },
    httpRequest: {
      method: "POST",
      endpoint: "/user/notifications/push/register"
    }
  }),

  //TiFAPI section in wiki
  /**
   * Gets the user's details.
   */
  getSelf: endpointSchema({
    input: {},
    outputs: {
      status200: SelfProfileSchema
    },
    httpRequest: {
      method: "GET",
      endpoint: `/user/self`
    }
  }),

  /**
   * Deletes the user's account.
   */
  removeAccount: endpointSchema({
    input: {},
    outputs: {
      status204: "no-content"
    },
    httpRequest: {
      method: "DELETE",
      endpoint: `/user/self`
    }
  }),

  /**
   * Gets details of another user.
   */
  getUser: endpointSchema({
    input: {
      params: z.object({
        userId: UserIDSchema
      })
    },
    outputs: {
      status200: UserProfileSchema,
      status403: userTiFAPIErrorSchema("blocked-you"),
      status404: UserNotFoundResponseSchema
    },
    httpRequest: {
      method: "GET",
      endpoint: `/user/:userId`
    }
  }),

  /**
   * Blocks a user.
   *
   * Blocks can be mutual (ie. 2 users can block each other regardless of if
   * they have been blocked by the user they are trying to block), so this
   * endpoint only fails if the given user id does not exist.
   */
  blockUser: endpointSchema({
    input: {
      params: z.object({
        userId: UserIDSchema
      })
    },
    outputs: {
      status204: "no-content",
      status404: UserNotFoundResponseSchema
    },
    httpRequest: {
      method: "PATCH",
      endpoint: `/user/block/:userId`
    }
  }),

  /**
   * Unblocks a user.
   *
   * Blocks can be mutual (ie. 2 users can block each other regardless of if
   * they have been blocked by the user they are trying to block), so this
   * endpoint only fails if the given user id does not exist or if the user
   * is not blocked in the first place.
   */
  unblockUser: endpointSchema({
    input: {
      params: z.object({
        userId: UserIDSchema
      })
    },
    outputs: {
      status204: "no-content",
      status404: UserNotFoundResponseSchema,
      status403: userTiFAPIErrorSchema("user-not-blocked")
    },
    httpRequest: {
      method: "DELETE",
      endpoint: `/user/block/:userId`
    }
  }),

  /**
   * Sends a friend request to the user represented by `receiverId`. If the 2 users have no
   * prior relationship, then a `friend-request-pending` status will be returned, otherwise
   * a `friends` status will be returned if the receiver has sent a friend request to the sender.
   */
  sendFriendRequest: endpointSchema({
    input: {
      params: z.object({
        userId: UserIDSchema
      })
    },
    outputs: {
      status200: UserFriendRequestResponseSchema,
      status201: UserFriendRequestResponseSchema,
      status403: userTiFAPIErrorSchema("blocked-you"),
      status404: UserNotFoundResponseSchema
    },
    httpRequest: {
      method: "POST",
      endpoint: `/user/friend/:userId`
    }
  }),

  /**
   * Returns the events in the area of the center with the given radius in
   * meters.
   */
  exploreEvents: endpointSchema({
    input: {
      body: z.object({
        userLocation: LocationCoordinate2DSchema,
        radius: z.number()
      })
    },
    outputs: {
      status200: EventsInAreaResponseSchema
    },
    httpRequest: {
      method: "POST",
      endpoint: "/event/region"
    }
  }),

  /**
   * Returns the remote settings for the current user.
   */
  userSettings: endpointSchema({
    input: {},
    outputs: {
      status200: UserSettingsResponseSchema
    },
    httpRequest: {
      method: "GET",
      endpoint: "/user/self/settings"
    }
  }),

  /**
   * Saves the specified user settings and returns the updated user settings.
   */
  saveUserSettings: endpointSchema({
    input: {
      body: UpdateUserSettingsRequestSchema
    },
    outputs: {
      status200: UserSettingsResponseSchema
    },
    httpRequest: {
      method: "PATCH",
      endpoint: "/user/self/settings"
    }
  })
} satisfies APISchema

export type TiFAPIClient<InputExtension = {}> = EndpointSchemasToFunctions<
  typeof TiFAPISchema,
  InputExtension
>

type APIResponse<T, U extends StatusCodes> = T extends { status: U } ? T : never

export type TiFEndpointResponse<
  EndpointName extends keyof TiFAPIClient,
  Status extends StatusCodes
> = APIResponse<Awaited<ReturnType<TiFAPIClient[EndpointName]>>, Status>["data"]
