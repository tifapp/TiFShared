import { z } from "zod"

export const tifAPIErrorSchema = <
  T extends z.Primitive,
  V extends z.Primitive[]
>(
  literal: T,
  ...literals: [...V]
) => {
  if (literals.length === 0) return z.object({ error: z.literal(literal) })
  return z.object({ error: z.enum([String(literal), ...literals.map((l) => String(l))]) })
}
