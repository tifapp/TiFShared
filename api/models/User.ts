import { z } from "zod"
import { UserSettings, UserSettingsSchema } from "../../domain-models/Settings"
import { UserHandleSchema, UserIDSchema } from "../../domain-models/User"
import { tifAPIErrorSchema } from "./Error"

export const userTiFAPIErrorSchema = <T extends z.Primitive>(literal: T) => {
  return tifAPIErrorSchema(literal).extend({
    userId: UserIDSchema
  })
}

export const UserNotFoundResponseSchema =
  userTiFAPIErrorSchema("user-not-found")

export const UpdateCurrentUserProfileRequestSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  handle: UserHandleSchema.optional()
})

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
