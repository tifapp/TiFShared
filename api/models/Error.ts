import { z } from "zod"

export const tifAPIErrorSchema = <
  T extends z.Primitive,
  V extends z.Primitive[]
>(
  literal: T,
  ...literals: [...V]
) => {
  if (literals.length === 0) return z.object({ error: z.literal(literal) })
  const [literal2, ...rest] = literals.map((l) => String(l))
  return z.object({ error: z.enum([String(literal), literal2, ...rest]) })
}