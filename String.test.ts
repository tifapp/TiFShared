import { StringUtils } from "./String"

describe("StringUtils tests", () => {
  test("capitalize first letter", () => {
    expect(StringUtils.capitalizeFirstLetter("")).toEqual("")
    expect(StringUtils.capitalizeFirstLetter("8")).toEqual("8")
    expect(StringUtils.capitalizeFirstLetter("hello world")).toEqual(
      "Hello world"
    )
  })

  test("is whitespace character", () => {
    expect(StringUtils.isWhitespaceCharacter(" ", 0)).toEqual(true)
    expect(StringUtils.isWhitespaceCharacter("h ", 0)).toEqual(false)
    expect(StringUtils.isWhitespaceCharacter("hello world", 5)).toEqual(true)
    expect(StringUtils.isWhitespaceCharacter("\n", 0)).toEqual(true)
    expect(StringUtils.isWhitespaceCharacter("\t", 0)).toEqual(true)
    expect(StringUtils.isWhitespaceCharacter("\r\n", 0)).toEqual(true)
    expect(StringUtils.isWhitespaceCharacter("", 0)).toEqual(false)
    expect(StringUtils.isWhitespaceCharacter("hello", 400)).toEqual(false)
  })

  test("extract numbers", () => {
    expect(StringUtils.extractNumbers("")).toEqual("")
    expect(StringUtils.extractNumbers("hello world")).toEqual("")
    expect(StringUtils.extractNumbers("hello 123")).toEqual("123")
    expect(StringUtils.extractNumbers("hello 00world")).toEqual("00")
    expect(StringUtils.extractNumbers("123")).toEqual("123")
    expect(StringUtils.extractNumbers("123abc")).toEqual("123")
  })
})
