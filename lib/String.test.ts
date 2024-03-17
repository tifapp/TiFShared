import {
  capitalizeFirstLetter,
  isWhitespaceCharacter,
  extractNumbers
} from "./String"

describe("StringUtils tests", () => {
  test("capitalize first letter", () => {
    expect(capitalizeFirstLetter("")).toEqual("")
    expect(capitalizeFirstLetter("8")).toEqual("8")
    expect(capitalizeFirstLetter("hello world")).toEqual("Hello world")
  })

  test("is whitespace character", () => {
    expect(isWhitespaceCharacter(" ", 0)).toEqual(true)
    expect(isWhitespaceCharacter("h ", 0)).toEqual(false)
    expect(isWhitespaceCharacter("hello world", 5)).toEqual(true)
    expect(isWhitespaceCharacter("\n", 0)).toEqual(true)
    expect(isWhitespaceCharacter("\t", 0)).toEqual(true)
    expect(isWhitespaceCharacter("\r\n", 0)).toEqual(true)
    expect(isWhitespaceCharacter("", 0)).toEqual(false)
    expect(isWhitespaceCharacter("hello", 400)).toEqual(false)
  })

  test("extract numbers", () => {
    expect(extractNumbers("")).toEqual("")
    expect(extractNumbers("hello world")).toEqual("")
    expect(extractNumbers("hello 123")).toEqual("123")
    expect(extractNumbers("hello 00world")).toEqual("00")
    expect(extractNumbers("123")).toEqual("123")
    expect(extractNumbers("123abc")).toEqual("123")
  })
})
