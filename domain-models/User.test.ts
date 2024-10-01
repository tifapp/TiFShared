import { linkify } from "../lib/LinkifyIt"
import { UserHandle, UserHandleLinkifyMatch, UserHandleSchema } from "./User"

describe("User tests", () => {
  describe("UserHandle tests", () => {
    it("should not pass validation when longer than 15 characters", () => {
      expect(UserHandle.parse("abcdefghijklmnopqrstuvwxyz").error).toEqual(
        "too-long"
      )
    })

    it("should not pass validation when empty", () => {
      expect(UserHandle.parse("").error).toEqual("empty")
    })

    it("should not pass validation when special characters included", () => {
      expect(UserHandle.parse("asdjkbnf&*(&*(").error).toEqual("bad-format")
    })

    test("basic valid user handles", () => {
      expect(UserHandle.parse("abc123").handle?.toString()).toEqual("@abc123")
      expect(UserHandle.parse("elon_musk").handle?.toString()).toEqual(
        "@elon_musk"
      )
      expect(UserHandle.parse("im_15_character").handle?.toString()).toEqual(
        "@im_15_character"
      )
      expect(UserHandle.parse("1234567890").handle?.toString()).toEqual(
        "@1234567890"
      )
      expect(UserHandle.parse("ABCDEFG").handle?.toString()).toEqual("@ABCDEFG")
    })

    test("equality", () => {
      let handle1 = UserHandle.optionalParse("hello")!
      let handle2 = UserHandle.optionalParse("world")!
      expect(handle1.isEqualTo(handle2)).toEqual(false)

      handle2 = UserHandle.optionalParse("hello")!
      expect(handle1.isEqualTo(handle2)).toEqual(true)
    })

    test("linkify parsing", () => {
      const str =
        "Hello @user @hello, make sure@interlinked names aren't parsed. Also the name has to be @valid(#*&$. @*($&) @world Now for a @superduperlongname"
      const matches = linkify
        .match(str)
        //@ts-expect-error extends Match
        ?.map((m: UserHandleLinkifyMatch) => m.userHandle.toString())
      expect(matches).toEqual([
        "@user",
        "@hello",
        "@valid",
        "@world",
        "@superduperlongn"
      ])
    })
  })
  
  describe("UserHandleSchema tests", () => {
    test("should successfully parse valid user handles", () => {
      const result = UserHandleSchema.parse("user123");
      expect(result).toBeInstanceOf(UserHandle);
      expect(JSON.stringify(result)).toBe("\"user123\"");
    });
  
    test("should fail to parse empty string", () => {
      expect(() => UserHandleSchema.parse("")).toThrow(`A valid user handle must have at least 1 character.`)
    });
  
    test("should fail to parse strings with invalid characters", () => {
      expect(() => UserHandleSchema.parse("kbnf&*(&*(")).toThrow(`A valid user handle only contains letters, numbers, and underscores.`);
    });
  
    test("should fail to parse strings that are too long", () => {
      expect(() => UserHandleSchema.parse("thishandleiswaytoolong")).toThrow(`A valid user handle can only be up to 15 characters long.`)
    });
  
    test("should pass through instances of UserHandle", () => {
      const handleInstance = UserHandle.optionalParse("existing_handle")!;
      expect(UserHandleSchema.parse(handleInstance)).toBe(handleInstance);
    });
  
    test("should fail to parse non-string types", () => {
      expect(() => UserHandleSchema.parse(123)).toThrow("Expected string, received number");
    });
  })
})
