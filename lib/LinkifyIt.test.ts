import { ensureWhitespaceBeforeSchemaValidator, linkify } from "./LinkifyIt"

describe("LinkifyIt tests", () => {
  test("add with whitespace validation, always returns string", () => {
    linkify.add("$", {
      validate: ensureWhitespaceBeforeSchemaValidator((text, pos) => {
        return text.substring(pos, text.indexOf(" ", pos))
      })
    })
    const str = "$money $money2 a$money3 "
    const matches = linkify.match(str)?.map((m) => m.text)
    expect(matches).toEqual(["$money", "$money2"])
  })

  test("add with whitespace validation, ignores undefined return values", () => {
    linkify.add("$", {
      validate: ensureWhitespaceBeforeSchemaValidator(() => undefined)
    })
    const str = "$money $money2 a$money3 "
    const matches = linkify.match(str)?.map((m) => m.text)
    expect(matches).toBeUndefined()
  })
})
