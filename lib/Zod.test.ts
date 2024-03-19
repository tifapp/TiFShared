import "./Zod"
import { ZodError, z } from "zod"

describe("ExtendedZod tests", () => {
  class NonZero {
    private constructor(readonly rawValue: number) {}

    static parse(number: number): NonZero | undefined {
      return number > 0 ? new NonZero(number) : undefined
    }
  }

  test("optional parseable, basic", () => {
    const NonZeroSchema = z.optionalParseable(NonZero)
    let result = NonZeroSchema.safeParse(-1)
    expect(result.success).toEqual(false)
    result = NonZeroSchema.safeParse(1)
    expect(result.success).toEqual(true)
  })

  test("optional parseable, error message", () => {
    const NonZeroSchema = z.optionalParseable(
      NonZero,
      (num) => `Invalid number: ${num}`
    )
    const result = NonZeroSchema.safeParse(-1000) as { error: ZodError }
    expect(JSON.parse(result.error.message)).toMatchObject([
      {
        message: "Invalid number: -1000"
      }
    ])
  })
})
