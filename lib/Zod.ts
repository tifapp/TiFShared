import { z } from "zod"
import { OptionalParseable } from "./Zod.d"

z.optionalParseable = <Input, Output>(
  parseable: OptionalParseable<Input, Output>,
  errorMessage?: (input: Input) => string
) => {
  let parsedValue: Output | undefined

  return z
    .custom<Input>()
    .superRefine((arg, ctx) => {
      // Check env if generating api schema
      // For schema generation
      if (!arg) return undefined;

      if (arg instanceof parseable.constructor) {
        parsedValue = arg as unknown as Output;
        return;
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
