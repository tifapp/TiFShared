import { ZodError, ZodIssue, ZodSchema, z } from "zod"
import { Constructor } from "./Types/HelperTypes"

const optionalParse = <Input, Output extends Constructor>(
  constructor: Output,
  parse: (input: Input) => InstanceType<Output>
) => {
  let parsedValue: InstanceType<Output>
  return z
    .custom<Input>()
    .superRefine((arg, ctx) => {
      if (arg instanceof constructor) {
        parsedValue = arg as InstanceType<Output>
        return
      }

      try {
        parsedValue = parse(arg)
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
    function optionalParseable<Input, Output extends Constructor>(
      constructor: Output,
      parseable: (input: Input) => InstanceType<Output>
    ): ReturnType<typeof optionalParse<Input, InstanceType<Output>>>

    /**
     * Infers a zod schema as a "Readonly" type.
     */
    type rInfer<Schema extends ZodSchema> = Readonly<z.infer<Schema>>
  }
}

z.optionalParseable = optionalParse
