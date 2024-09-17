import { z } from "zod"
import { UserSettings, UserSettingsSchema } from "../../domain-models/Settings"
import { FriendRequestPendingStatusSchema, FriendsStatusSchema, UserHandleSchema, UserIDSchema, UserToProfileRelationStatusSchema } from "../../domain-models/User"
import { tifAPIErrorSchema } from "./Error"

export const userTiFAPIErrorSchema = <T extends z.Primitive>(literal: T) => {
  return tifAPIErrorSchema(literal).extend({
    userId: UserIDSchema
  })
}

export const UserNotFoundResponseSchema =
  userTiFAPIErrorSchema("user-not-found")

export const BlockedUserResponseSchema =
  userTiFAPIErrorSchema("blocked")

export const UpdateCurrentUserProfileRequestSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  handle: UserHandleSchema.optional()
})

    // isEventNotificationsEnabled,
    // isMentionsNotificationsEnabled,
    // isChatNotificationsEnabled,
    // isFriendRequestNotificationsEnabled
export type UpdateCurrentUserProfileRequest = z.rInfer<
  typeof UpdateCurrentUserProfileRequestSchema
>

export const UpdateUserSettingsRequestSchema = UserSettingsSchema.omit({
  version: true
}).partial()

export type UpdateUserSettingsRequest = z.rInfer<
  typeof UpdateUserSettingsRequestSchema
>

export type UserSettingsResponse = UserSettings

export const UserSettingsResponseSchema = UserSettingsSchema

export const UserFriendRequestResponseSchema = z.object({status: z.union([FriendRequestPendingStatusSchema, FriendsStatusSchema])})

const DevicePlatformSchema = z.literal("apple").or(z.literal("android"))

export const SelfProfileSchema = z.object({
  id: UserIDSchema,
  name: z.string().optional(),
  bio: z.string().optional(),
  handle: UserHandleSchema,
  createdDateTime: z.coerce.date(),
  profileImageURL: z.string().url().optional(),
  updatedDateTime: z.coerce.date(),
})

export const UserProfileSchema = z.object({
  id: UserIDSchema,
  name: z.string().optional(),
  bio: z.string().optional(),
  handle: UserHandleSchema,
  createdDateTime: z.coerce.date(),
  profileImageURL: z.string().url().optional(),
  updatedDateTime: z.coerce.date(),
  relations: z.object({
    fromThemToYou: UserToProfileRelationStatusSchema,
    fromYouToThem: UserToProfileRelationStatusSchema
  })
})

export const RegisterPushTokenRequestSchema = z.object({
  pushToken: z.string().min(1), //generic nonempty string schema?
  platformName: DevicePlatformSchema
})

export type DevicePlatform = z.infer<typeof DevicePlatformSchema>