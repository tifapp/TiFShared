import { NonEmptyArray } from "lib/Types/HelperTypes";
import { z } from "zod";

export const tifAPIErrorSchema = <
  T extends NonEmptyArray<string>
>(
  ...literals: T
) => {
  return z.object({
    error: z.enum(literals),
  });
};
