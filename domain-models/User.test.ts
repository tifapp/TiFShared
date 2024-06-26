import { linkify } from "../lib/LinkifyIt"
import { UserHandle, UserHandleLinkifyMatch } from "./User"

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
})
