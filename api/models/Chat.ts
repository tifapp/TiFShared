import { z } from "zod"

export const ChatTokenRequestSchema = z.object({
  capability: z.string(),
  clientId: z.string().uuid(),
  keyName: z.string(),
  mac: z.string(),
  timestamp: z.number(),
  nonce: z.string().min(16)
})

export type ChatTokenRequest = z.rInfer<typeof ChatTokenRequestSchema>
