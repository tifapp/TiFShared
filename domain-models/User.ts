import { Match } from "linkify-it"
import { z } from "zod"
import {
  ensureWhitespaceBeforeSchemaValidator,
  linkify
} from "../lib/LinkifyIt"
import { Tagged } from "../lib/Types/HelperTypes"

export type UserID = Tagged<string, "userId">

export const UserIDSchema = z
  .string()
  .uuid()
  .transform((id) => id as UserID)

export const BlockedYouStatusSchema = z.literal("blocked-you")
export const BlockedThemStatusSchema = z.literal("blocked-them")
export const NotFriendsStatusSchema = z.literal("not-friends")
export const FriendRequestSentStatusSchema = z.literal("friend-request-sent")
export const FriendRequestReceivedStatusSchema = z.literal("friend-request-received")
export const FriendsStatusSchema = z.literal("friends")
export const CurrentUserStatusSchema = z.literal("current-user")

export const UserToProfileRelationStatusSchema = z.union([
  NotFriendsStatusSchema,
  FriendRequestSentStatusSchema,
  FriendsStatusSchema,
  BlockedThemStatusSchema,
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


/**
 * A 2-way relationship from a user to another profile where at least one party
 * involved is blocking the other.
 */
export type BlockedUserRelationsStatus = z.rInfer<
  typeof BlockedYouStatusSchema
>

export const UnblockedUserRelationsSchema = z.enum([
  BlockedThemStatusSchema.value,
  NotFriendsStatusSchema.value,
  FriendRequestSentStatusSchema.value,
  FriendRequestReceivedStatusSchema.value,
  FriendsStatusSchema.value,
  CurrentUserStatusSchema.value
])

/**
 * A 2-way relationship from a user to another profile where no party is blocking the other.
 */
export type UnblockedUserRelationsStatus = z.rInfer<
  typeof UnblockedUserRelationsSchema
>

/**
 * A descriptor of a 2-way relationship between 2 users.
 */
export type UserRelationsStatus =
  | UnblockedUserRelationsStatus
  | BlockedUserRelationsStatus

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
  static readonly LINKIFY_SCHEMA = "@"

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

  private static REGEX = /^[A-Za-z0-9_]{1,15}/

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
    } else if (
      UserHandle.parseUntilInvalidCharacter(rawValue)?.rawValue !== rawValue
    ) {
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

  /**
   * Parses this user handle using only the first valid characters from the
   * string.
   *
   * Ex. `"hello#$*(&$"` -> `"@hello"`
   */
  static parseUntilInvalidCharacter(rawValue: string) {
    const match = rawValue.match(UserHandle.REGEX)
    if (!match) return undefined
    return new UserHandle(match[0])
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
  // @ts-ignore Typescript error - Constructor is private
  UserHandle,
  (arg: UserHandle | string) => {
    const parseResult = UserHandle.parse(z.string().parse(arg))

    if (parseResult.error === "bad-format") {
      throw new Error("A valid user handle only contains letters, numbers, and underscores.")
    } else if (parseResult.error === "empty") {
      throw new Error("A valid user handle must have at least 1 character.")
    } else if (parseResult.error === "too-long") {
      throw new Error("A valid user handle can only be up to 15 characters long.")
    } else {
      return parseResult.handle
    }
  }
)

export type UserHandleLinkifyMatch = Match & { userHandle: UserHandle }

let _linkifyParsedHandle: UserHandle | undefined
linkify.add(UserHandle.LINKIFY_SCHEMA, {
  validate: ensureWhitespaceBeforeSchemaValidator((text, pos) => {
    const slice = text.slice(pos)
    _linkifyParsedHandle = UserHandle.parseUntilInvalidCharacter(
      slice.split(/\s/, 1)[0] ?? slice
    )
    return _linkifyParsedHandle
  }),
  normalize: (match: UserHandleLinkifyMatch) => {
    // NB: We shouldn't get past validate if the parsed handle is undefined.
    match.userHandle = _linkifyParsedHandle!
  }
})
