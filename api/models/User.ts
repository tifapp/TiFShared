import { UserHandle, UserIDSchema } from "../../domain-models/User"
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
