import { IssueData, ZodError, ZodIssueCode, ZodSchema, ZodType, ZodTypeDef, z } from "zod";
import { Prototype } from "./Types/HelperTypes";

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
  let issues: IssueData[] = [];

  return z
    .custom<Input>()
    .transform((arg) => {
      if (arg instanceof clazz) {
        return arg as unknown as Output;
      }

      try {
        return schema.parse(arg);
      } catch (e) {
        issues = e instanceof ZodError
          ? e.issues
          : [{
              message: e.message,
              code: ZodIssueCode.custom,
              params: { arg },
              fatal: true,
            }];
        return arg;
      }
    })
    .superRefine((_, ctx) => {
      issues.forEach(ctx.addIssue);
      issues.length = 0; // NB: Clear issues between calls
    });
};

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
