import { linkify } from "../lib/LinkifyIt"
import { ColorString } from "./ColorString"
import { EventHandle, EventHandleLinkifyMatch } from "./Event"

describe("EventModels tests", () => {
  describe("EventHandle tests", () => {
    it("should be able to parse a valid handle string", () => {
      const handle = EventHandle.parse("17|123/#123456/Pickup Basketball")
      expect(handle?.eventId).toEqual(123)
      expect(handle?.eventName).toEqual("Pickup Basketball")
      expect(handle?.color).toEqual(ColorString.parse("#123456"))
    })

    it("should truncate the event name based on the length encoded in the handle", () => {
      const handle = EventHandle.parse("12|123/#123456/Pickup Basketball")
      expect(handle?.eventName).toEqual("Pickup Baske")
    })

    it("should be able to parse a valid handle string where the length is longer than the name", () => {
      const handle = EventHandle.parse("420|123/#123456/Pickup Basketball")
      expect(handle?.eventName).toEqual("Pickup Basketball")
    })

    it("should be able to parse a valid handle from a starting point in the given string", () => {
      const handle = EventHandle.parse(
        "!!!!17|123/#123456/Pickup Basketball",
        4
      )
      expect(handle?.eventId).toEqual(123)
      expect(handle?.eventName).toEqual("Pickup Basketball")
    })

    test("invalid handles", () => {
      expect(EventHandle.parse("")).toBeUndefined()
      expect(EventHandle.parse("123/Pickup Basketball")).toBeUndefined()
      expect(EventHandle.parse("17|Pickup Basketball")).toBeUndefined()
      expect(EventHandle.parse("hello world")).toBeUndefined()
      expect(EventHandle.parse("abc|123/Pickup Basketball")).toBeUndefined()
      expect(EventHandle.parse("17|abc/Pickup Basketball")).toBeUndefined()
      expect(EventHandle.parse("!17|123/Pickup Basketball")).toBeUndefined()
      expect(
        EventHandle.parse("17|123/#ZZZZZZ/Pickup Basketball")
      ).toBeUndefined()
      expect(
        EventHandle.parse("abc|123/#123456/Pickup Basketball")
      ).toBeUndefined()
      expect(
        EventHandle.parse("17|abc/#123456/Pickup Basketball")
      ).toBeUndefined()
    })

    test("toString", () => {
      expect(
        new EventHandle(
          123,
          "Pickup Basketball",
          ColorString.parse("#123456")!
        ).toString()
      ).toEqual("!17|123/#123456/Pickup Basketball")
    })

    test("linkify parsing", () => {
      const str =
        "Want to play some !17|123/#123456/Pickup Basketball? It!17|123/#123456/Pickup Basketball !17|123/#hibdc/Invalid is really fun! !21|124/#ABCDEF/Riku lied people died"
      const matches = linkify
        .match(str)
        ?.map((m: EventHandleLinkifyMatch) => m.eventHandle)
      expect(matches).toEqual([
        new EventHandle(
          123,
          "Pickup Basketball",
          ColorString.parse("#123456")!
        ),
        new EventHandle(
          124,
          "Riku lied people died",
          ColorString.parse("#ABCDEF")!
        )
      ])
    })
  })
})
