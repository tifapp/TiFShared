import { base64URLDecode, base64URLEncode } from "./Base64URLCoding"

describe("Base64URLCoding tests", () => {
  test("encode", () => {
    expect(base64URLEncode("hello, world")).toEqual("aGVsbG8sIHdvcmxk")
  })

  test("decode", () => {
    expect(base64URLDecode("aGVsbG8sIHdvcmxk")).toEqual("hello, world")
  })
})
