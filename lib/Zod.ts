import { ZodError, ZodIssue, ZodSchema, ZodType, ZodTypeDef, z } from "zod"
import { Prototype } from "./Types/HelperTypes"

/**
 * optionalParse creates a Zod schema that accepts either an instance of a class
 * or raw input that can be transformed into an instance of that class.
 *
 * @param clazz - The class (can have public or private constructor).
 * @param schema - A Zod schema that validates and transforms raw input into the desired Output type.
 * @returns A Zod schema that accepts either an instance of the class or raw input.
 */
const optionalParse = <Output extends Prototype, Input>(
  clazz: Output,
  schema: ZodType<Output, ZodTypeDef, Input>
) => {
  let parsedValue: Output
  return z
    .custom<Input>()
    .superRefine((arg, ctx) => {
      if (arg instanceof clazz) {
        parsedValue = arg as unknown as Output
        return
      }

      try {
        parsedValue = schema.parse(arg)
      } catch (e) {
        if (e instanceof ZodError) {
          e.issues.forEach((issue: ZodIssue) => {
            ctx.addIssue(issue);
          });
        } else {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: e.message,
            params: { arg },
            fatal: true
          })
        }
      }
    })
    .transform(() => parsedValue) // NB: Needed to return the parsed value
}

declare module "zod" {
  export namespace z {
    /**
     * Creates a zod schema from an object which comforms to the {@link OptionalParseable} interface.
     *
     * This is mostly useful for createing Zod Schemas for rich doamin types like {@link UserHandle},
     * which take in a string input, but want an output of themself.
     *
     * Ex.
     * ```ts
     * class DataType {
     *   static parse (rawValue: string): DataType | undefined {
     *     // Validate that the string is indeed a valid "DataType" then return an instance of "DataType"
     *     // if so, else undefined. ...
     *   }
     *
     *   static zodSchema = z.optionalParseable(DataType)
     * }
     * ```
     *
     * @param parseable see {@link OptionalParseable}
     * @param errorMessage a function that gets the error message when parsing fails.
     * @returns a zod schema that wraps the parseable.
     */
    function optionalParseable<Output extends Prototype, Input>(
      constructor: Output,
      schema: ZodType<Output["prototype"], ZodTypeDef, Input>
    ): ZodType<Output["prototype"], ZodTypeDef, Input>

    /**
     * Infers a zod schema as a "Readonly" type.
     */
    type rInfer<Schema extends ZodSchema> = Readonly<z.infer<Schema>>
  }
}

z.optionalParseable = optionalParse
