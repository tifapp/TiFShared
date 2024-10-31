import { jwtBody } from "./JWT"

describe("JWT tests", () => {
  describe("JWTBody tests", () => {
    it.each([
      "",
      "dkjhkjdhkjhdkhkdikhojodjs",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQSflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxN.TE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    ])("should return undefined for %s", (invalidJwt: string) => {
      expect(jwtBody(invalidJwt)).toEqual(undefined)
    })

    it.each([
      [
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        { sub: "1234567890", name: "John Doe", iat: 1516239022 }
      ],
      [
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDIsIm5hbWUiOiJCaXRjaGVsbCBEaWNrbGUifQ.UfbiTs-VWvxagoAk1YkJ9HzrjQiMY_2Ln7Op_BjN_xg",
        {
          id: 42,
          name: "Bitchell Dickle"
        }
      ],
      [
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.Et9HFtf9R3GEMA0IICOfFMVXY7kkTX1wr4qCyhIf58U",
        {}
      ]
    ])(
      "should return the body contents of %s",
      (jwt: string, body: Record<string, any>) => {
        expect(jwtBody(jwt)).toEqual(body)
      }
    )
  })
})
