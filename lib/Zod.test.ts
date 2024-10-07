import { ZodError, z } from "zod";
import "./Zod";

describe("ExtendedZod tests", () => {
  class Positive {
    constructor(readonly rawValue: number) {
      if (rawValue <= 0) {
        throw new Error("Number must be greater than 0.")
      }
    }
  }
  
  const PositiveSchema = z.optionalParseable(Positive, z.number().transform(rawValue => new Positive(rawValue)))

  test("optional parseable, basic", () => {
    let result = PositiveSchema.safeParse(-1)
    expect(result.success).toEqual(false)
    result = PositiveSchema.safeParse(1)
    expect(result.success).toEqual(true)
  })
  
  test("optional parseable, pass instances of the constructor", () => {
    const parseSpy = jest.spyOn(z.ZodNumber.prototype, 'parse')
    
    const result = PositiveSchema.safeParse(new Positive(1))
    expect(result.success).toEqual(true)
    expect(parseSpy).not.toHaveBeenCalled()
    
    parseSpy.mockRestore()
  })
  
  test("optional parseable, zod error message", () => {
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
    const result = PositiveSchema.safeParse(-1000) as { error: ZodError }
    expect(JSON.parse(result.error.message)).toMatchObject([
      {
        message: "Number must be greater than 0.",
        params: { arg: -1000 }
      }
    ])
  })
})
