import { z } from "zod"

export type UserID = string

export const UserIDSchema = z.string().uuid()

export const NotFriendsStatusSchema = z.literal("not-friends")
export const FriendRequestPendingStatusSchema = z.literal(
  "friend-request-pending"
)
export const FriendsStatusSchema = z.literal("friends")
export const BlockedStatusSchema = z.literal("blocked")
export const CurrentUserStatusSchema = z.literal("current-user")

export const UserToProfileRelationStatusSchema = z.union([
  NotFriendsStatusSchema,
  FriendRequestPendingStatusSchema,
  FriendsStatusSchema,
  BlockedStatusSchema,
  CurrentUserStatusSchema
])

/**
 * A relationship for a user to a specified profile.
 *
 * The statuses are very much like other social platforms. You can send friend requests
 * to users, and they can choose to accept thus becoming `"friends"`.
 *
 * Users can also block each other, which functions almost exactly like other social platforms.
 *
 * `"not-friends'"` is used as the default status when no other status applies.
 */
export type UserToProfileRelationStatus = z.rInfer<
  typeof UserToProfileRelationStatusSchema
>

export const BlockedBidirectionalUserRelationsSchema = z.union([
  z.object({
    themToYou: BlockedStatusSchema,
    youToThem: BlockedStatusSchema
  }),
  z.object({
    themToYou: BlockedStatusSchema,
    youToThem: NotFriendsStatusSchema
  })
])

/**
 * A 2-way relationship from a user to another profile where at least one party
 * involved is blocking the other.
 */
export type BlockedBidirectionalUserRelations = z.rInfer<
  typeof BlockedBidirectionalUserRelationsSchema
>

export const UnblockedBidirectionalUserRelationsSchema = z.union([
  z.object({
    themToYou: NotFriendsStatusSchema,
    youToThem: NotFriendsStatusSchema
  }),
  z.object({
    themToYou: FriendRequestPendingStatusSchema,
    youToThem: NotFriendsStatusSchema
  }),
  z.object({
    themToYou: NotFriendsStatusSchema,
    youToThem: BlockedStatusSchema
  }),
  z.object({
    themToYou: NotFriendsStatusSchema,
    youToThem: FriendRequestPendingStatusSchema
  }),
  z.object({
    themToYou: FriendsStatusSchema,
    youToThem: FriendsStatusSchema
  }),
  z.object({
    themToYou: CurrentUserStatusSchema,
    youToThem: CurrentUserStatusSchema
  })
])

/**
 * A 2-way relationship from a user to another profile where no party is blocking the other.
 */
export type UnblockedBidirectionalUserRelations = z.rInfer<
  typeof UnblockedBidirectionalUserRelationsSchema
>

/**
 * An reason that a user handle's raw text was unable to be parsed.
 */
export type UserHandleParsingError = "bad-format" | "empty" | "too-long"

export type UserHandleParsingResult =
  | { handle: UserHandle; error: undefined }
  | { handle: undefined; error: UserHandleParsingError }

/**
 * A union type representing the reason that a user handle could be invalid,
 * namely if it's already taken or is in an improper format.
 */
export type UserHandleError = "already-taken" | UserHandleParsingError

/**
 * A class representing a valid user handle string.
 */
export class UserHandle {
  readonly rawValue: string

  private constructor(rawValue: string) {
    this.rawValue = rawValue
  }

  /**
   * Formats this handle by prefixing the string with an "@".
   */
  toString() {
    return `@${this.rawValue}`
  }

  toJSON() {
    return this.rawValue
  }

  isEqualTo(other: UserHandle) {
    return this.rawValue === other.rawValue
  }

  private static REGEX = /^[A-Za-z0-9_]{1,15}$/

  /**
   * Validates a raw user handle string and returns an instance of this
   * class if the handle is valid.
   *
   * A valid user handle is similar to a twitter handle.
   * In this case, the handle is not required to be prefixed with an "@", but
   * it must only contain alphanumeric characters and underscores. It also
   * must be less than 15 characters.
   *
   * @param rawValue the raw user handle string to validate
   * @returns an {@link UserHandle} instance if successful.
   */
  static parse(rawValue: string): UserHandleParsingResult {
    if (rawValue.length === 0) {
      return { handle: undefined, error: "empty" }
    } else if (rawValue.length > 15) {
      return { handle: undefined, error: "too-long" }
    } else if (!UserHandle.REGEX.test(rawValue)) {
      return { handle: undefined, error: "bad-format" }
    } else {
      return { handle: new UserHandle(rawValue), error: undefined }
    }
  }

  /**
   * Attempts to parse this handle and returns `undefined` if the handle can't be parsed.
   */
  static optionalParse(rawValue: string) {
    return UserHandle.parse(rawValue).handle
  }

  static bitchellDickle = UserHandle.optionalParse("bictchell_dickle")!
  static sillyBitchell = UserHandle.optionalParse("silly_bitchell")!
  static alvis = UserHandle.optionalParse("alvis")!
  static zed = UserHandle.optionalParse("Z")!
}

/**
 * A zod schema that converts a string to an {@link UserHandle}.
 */
export const UserHandleSchema = z.optionalParseable(
  {
    parse: (rawValue: string) => UserHandle.optionalParse(rawValue)
  },
  () => {
    return "A valid user handle only contains letters, numbers, underscores, and can only be upto 15 characters long."
  }
)
