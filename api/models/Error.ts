import { z } from "zod";
import { NonEmptyArray } from "../../lib/Types/HelperTypes";

export const tifAPIErrorSchema = <
  const T extends NonEmptyArray<string>
>(
  ...literals: T
) => {
  return z.object({
    error: z.enum(literals),
  });
};
