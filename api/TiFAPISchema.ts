import { z } from "zod";
import { EventAttendeesPageSchema, EventIDSchema, EventRegionSchema, TrackableEventArrivalRegionsSchema } from "../domain-models/Event";
import { LocationCoordinate2DSchema } from "../domain-models/LocationCoordinate2D";
import { UserHandleSchema, UserIDSchema } from "../domain-models/User";
import { MatchFnCollection } from "../lib/Types/MatchType";
import { EndpointSchemaToMiddleware, EndpointSchemasToFunctions, assertEndpointSchemaType } from "./TransportTypes";
import { APIImplementationCollector, implementAPI } from "./implementAPI";
import { tifAPIErrorSchema } from "./models/Error";
import { EventNotFoundErrorSchema, EventResponseSchema, EventWhenBlockedByHostResponseSchema, EventsInAreaResponseSchema, JoinEventResponseSchema } from "./models/Event";
import { UpdateCurrentUserProfileRequestSchema, UpdateUserSettingsRequestSchema, UserNotFoundResponseSchema, UserSettingsResponseSchema, userTiFAPIErrorSchema } from "./models/User";

const TiFAPISchema = {
  /**
   * Creates the user's TiF profile after they have fully signed up and verified their account.
   *
   * @returns an object containing the user's id and generated user handle.
   */
  createCurrentUserProfile: assertEndpointSchemaType({
    input: {},
    outputs: {
      status201: z.object({
        id: UserIDSchema,
        handle: UserHandleSchema
      })
    },
    httpRequest: {
      method: "POST",
      endpoint: "/user"
    }
  }),

  /**
   * Updates the current user's profile attributes.
   */
  updateCurrentUserProfile: assertEndpointSchemaType({
    input: {
      body: UpdateCurrentUserProfileRequestSchema
    },
    outputs: {
      status204: "no-content",
    },
    httpRequest: {
      method: "PATCH",
      endpoint: "/user/self",
    },
  }),

  /**
   * Given a partial handle, returns a list of autocompleted users with a similar handle.
   *
   * @param handle a handle string.
   * @param limit the maximum amount of users to return.
   * @param signal an {@link AbortSignal} to cancel the query.
   * @returns an object with a list of users containing their name, handle, and id.
   */
  autocompleteUsers: assertEndpointSchemaType({
    input: {
      query: z.object({
        handle: z.string(), 
        limit: z.number()
      })
    },
    outputs: {
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
    httpRequest: {
      method: "GET",
      endpoint: "/user/autocomplete",
    }
  }),
  
  /**
   * Indicates that the user has arrived at the given region.
   *
   * @returns a list of regions of the user's upcoming events.
   */
  arriveAtRegion: assertEndpointSchemaType({
    input: {
      body: EventRegionSchema
    },
    outputs: {
      status200: TrackableEventArrivalRegionsSchema
    },
    httpRequest: {
      method: "POST",
      endpoint: "/event/arrived",
    }
  }),
  
  /**
   * Indicates that the user has departed from the given region.
   *
   * @returns a list of regions of the user's upcoming events.
   */
  departFromRegion: assertEndpointSchemaType({
    input: {
      body: EventRegionSchema
    },
    outputs: {
      status200: TrackableEventArrivalRegionsSchema
    },
    httpRequest: {
      method: "POST",
      endpoint: "/event/departed",
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
  upcomingEventArrivalRegions: assertEndpointSchemaType({
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
  eventDetails: assertEndpointSchemaType({
    input: {
      params: z.object({
        eventId: EventIDSchema
      })
    },
    outputs: {
      status200: EventResponseSchema,
      status204: "no-content",
      status404: EventNotFoundErrorSchema,
      status403: EventWhenBlockedByHostResponseSchema
    },
    constraints: (input, output) => {
      if (output.status === 200 || output.status === 403) {
        return output.data.id === input.params.eventId
      }

      return true;
    },
    httpRequest: {
      method: "GET",
      endpoint: `/event/details/:eventId`
    },
  }),
  
  /**
   * Fetches a paginated list of attendees for a given event.
   * 
   * @param eventId The id of the event to check.
   * @param limit the maximum amount of users to return.
   * @param nextPage points to a particular section in the attendees list
   */
  attendeesList: assertEndpointSchemaType({
    input: {
      params: z.object({
        eventId: EventIDSchema
      }),
      query: z.object({
        limit: z.number(),
        nextPage: z.string().optional()
      }),
    },
    outputs: {
      status200: EventAttendeesPageSchema,
      status204: "no-content",
      status404: EventNotFoundErrorSchema,
      status403: tifAPIErrorSchema("blocked-by-host")
    },
    httpRequest: {
      method: "GET",
      endpoint: `/event/attendees/:eventId`,
    },
  }),
  
  /**
   * Joins the event with the given id.
   *
   * @param eventId The id of the event to join.
   * @param arrivalRegion A region to pass for marking an initial arrival if the user has arrived in the area of the event.
   * @returns The upcoming event arrivals based on the user joining this event, and a token request for the event group chat.
   */
  joinEvent: assertEndpointSchemaType({
    input: {
      params: z.object({
        eventId: EventIDSchema
      }),
      body: z.object({
        region: EventRegionSchema
      }).optional(),
    },
    outputs: {
      status403: tifAPIErrorSchema(
        "event-has-ended",
        "event-was-cancelled",
        "user-is-blocked"
      ),
      status201: JoinEventResponseSchema,
      status200: JoinEventResponseSchema
    },
    constraints: (input, output) => {
      if (output.status === 200 || output.status === 201) {
        return output.data.id === input.params.eventId
      }

      return true;
    },
    httpRequest: {
      method: "POST",
      endpoint: `/event/join/:eventId`,
    },
  }),
  
  /**
   * Leaves the event with the given id.
   *
   * @param eventId The id of the event to leave.
   */
  leaveEvent: assertEndpointSchemaType({
    input: {
      params: z.object({
        eventId: EventIDSchema
      }),
    },
    outputs: {
      status403: tifAPIErrorSchema(
        "event-has-been-cancelled",
        "event-has-ended"
      ),
      status400: tifAPIErrorSchema("co-host-not-found", "already-left-event"),
      status204: "no-content"
    },
    httpRequest: {
      method: "POST",
      endpoint: `/event/leave/:eventId`
    },
  }),

  /**
   * Registers for the user for push notifications given a push token and a
   * platform name.
   */
  registerForPushNotifications: assertEndpointSchemaType({
    input: {
      body: z.object({
        pushToken: z.string(),
        platformName: z.literal("apple").or(z.literal("android"))
      })
    },
    outputs: {
      status201: z.object({ status: z.literal("inserted") }),
      status400: tifAPIErrorSchema("token-already-registered")
    },
    httpRequest: {
      method: "POST",
      endpoint: "/user/notifications/push/register",
    }
  }),
  
  /**
   * Blocks a user.
   *
   * Blocks can be mutual (ie. 2 users can block each other regardless of if
   * they have been blocked by the user they are trying to block), so this
   * endpoint only fails if the given user id does not exist.
   */
  blockUser: assertEndpointSchemaType({
    input: {
      params: z.object({
        id: UserIDSchema
      })
    },
    outputs: {
      status204: "no-content",
      status404: UserNotFoundResponseSchema
    },
    httpRequest: {
      method: "PATCH",
      endpoint: `/user/block/:id`
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
  unblockUser: assertEndpointSchemaType({
    input: {
      params: z.object({
        id: UserIDSchema
      })
    },
    outputs: {
      status204: "no-content",
      status404: UserNotFoundResponseSchema,
      status403: userTiFAPIErrorSchema("user-not-blocked")
    },
    httpRequest: {
      method: "DELETE",
      endpoint: `/user/block/:id`
    },
  }),

  /**
   * Returns the events in the area of the center with the given radius in
   * meters.
   */
  exploreEvents: assertEndpointSchemaType({
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
      endpoint: "/event/region",
    },
  }),

  /**
   * Returns the remote settings for the current user.
   */
  userSettings: assertEndpointSchemaType({
    input: {},
    outputs: { 
      status200: UserSettingsResponseSchema 
    },
    httpRequest: {
      method: "GET",
      endpoint: "/user/self/settings"
    },
  }),
  
  /**
   * Saves the specified user settings and returns the updated user settings.
   */
  saveUserSettings: assertEndpointSchemaType({
    input: {
      body: UpdateUserSettingsRequestSchema
    },
    outputs: { 
      status200: UserSettingsResponseSchema 
    },
    httpRequest: {
      method: "PATCH",
      endpoint: "/user/self/settings",
    },
  }),
}

export type TiFAPIClient = EndpointSchemasToFunctions<typeof TiFAPISchema>

/**
 * Implement the functions described in the endpoint schema, given TiFAPIMiddleware or direct implementation functions. 
 *
 * ```ts
 * const EndpointSchema = {
 *  createCurrentUserProfile: assertEndpointSchemaType({
 *    input: {},
 *      outputs: {
 *         status201: z.object({
 *            id: z.string(),
 *          })
 *      },
 *      httpRequest: {
 *        method: "POST",
 *        endpoint: "/user"
 *      }
 *  }),
 * }
 *
 * const api = await implementTiFAPI(
 *  (endpointName, { httpRequest: { endpoint, method } }) => 
 *    async ({ body } = {}) =>
 *      fetchFunction(endpoint, method, body),
 * )
 *
 * const response = await api.createCurrentUserProfile()
 * //response is inferred to be {status: 201, data: {id: string}}
 * ```
 */
export const implementTiFAPI = <Fns extends TiFAPIClient>(
  endpointSchemaToMiddleware?: EndpointSchemaToMiddleware, 
  implementations?: MatchFnCollection<TiFAPIClient, Fns>,
  implementationCollector?: APIImplementationCollector
): TiFAPIClient => 
  implementAPI(
    TiFAPISchema,
    endpointSchemaToMiddleware, 
    implementations, 
    implementationCollector
  )
