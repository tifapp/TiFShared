import {
  UserHandle,
  UserIDSchema,
  UserSettings,
  UserSettingsSchema
} from "../../domain-models/User"
import { tifAPIErrorSchema } from "./Error"
import { z } from "zod"

export const userTiFAPIErrorSchema = <T extends z.Primitive>(literal: T) => {
  return tifAPIErrorSchema(literal).extend({
    userId: UserIDSchema
  })
}

export const UserNotFoundResponseSchema =
  userTiFAPIErrorSchema("user-not-found")

export type UpdateCurrentUserProfileRequest = Partial<{
  name: string
  bio: string
  handle: UserHandle
}>

export const UpdateUserSettingsRequestSchema = UserSettingsSchema.omit({
  version: true
}).partial()

export type UpdateUserSettingsRequest = z.rInfer<
  typeof UpdateUserSettingsRequestSchema
>

export type UserSettingsResponse = UserSettings

export const UserSettingsResponseSchema = UserSettingsSchema
