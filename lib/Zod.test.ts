import { ZodError, z } from "zod";
import "./Zod";

describe("ExtendedZod tests", () => {
  class Positive {
    constructor(readonly rawValue: number) {}

    static parse(arg: number): Positive | Error {
      const result = z.number().safeParse(arg)

      if (!result.success) {
        return result.error;
      }

      return result.data > 0 ? new Positive(result.data) : new Error("Number must be greater than 0.");
    }
  }

  test("optional parseable, basic", () => {
    const PositiveSchema = z.optionalParseable(Positive)
    let result = PositiveSchema.safeParse(-1)
    expect(result.success).toEqual(false)
    result = PositiveSchema.safeParse(1)
    expect(result.success).toEqual(true)
  })
  
  test("optional parseable, zod error message", () => {
    const PositiveSchema = z.optionalParseable(Positive)
    const result = PositiveSchema.safeParse("invalid input") as { error: ZodError }
    expect(JSON.parse(result.error.message)).toMatchObject([
      {
        "code": "invalid_type",
        "expected": "number",
        "received": "string",
        "message": "Expected number, received string"
      }
    ])
  })

  test("optional parseable, custom error message", () => {
    const PositiveSchema = z.optionalParseable(Positive)
    const result = PositiveSchema.safeParse(-1000) as { error: ZodError }
    expect(JSON.parse(result.error.message)).toMatchObject([
      {
        message: "Number must be greater than 0.",
        params: { arg: -1000 }
      }
    ])
  })
})
