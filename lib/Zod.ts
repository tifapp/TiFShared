import { ZodSchema, z } from "zod"

/**
 * An interface which defines a method of parsing that returns either an output type or `undefined`.
 */
export interface OptionalParseable<Input, Output> {
  parse(input: Input): Output | undefined
}

const optionalParse = <Input, Output>(
  parseable: OptionalParseable<Input, Output>,
  errorMessage?: (input: Input) => string
) => {
  let parsedValue: Output | undefined
  return z
    .custom<Input>()
    .superRefine((arg, ctx) => {
      if (arg instanceof parseable.constructor) {
        parsedValue = arg as unknown as Output
        return
      }

      parsedValue = parseable.parse(arg)
      if (!parsedValue) {
        const message = errorMessage?.(arg)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${message ? message + " " : ""}(Received: ${arg})`,
          fatal: true
        })
      }
    })
    .transform(() => parsedValue!)
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
    function optionalParseable<Input, Output>(
      parseable: OptionalParseable<Input, Output>,
      errorMessage?: (input: Input) => string
    ): ReturnType<typeof optionalParse<Input, Output>>

    /**
     * Infers a zod schema as a "Readonly" type.
     */
    type rInfer<Schema extends ZodSchema> = Readonly<z.infer<Schema>>
  }
}

z.optionalParseable = optionalParse
