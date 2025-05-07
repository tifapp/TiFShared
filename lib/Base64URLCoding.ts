/**
 * A Base64 URL String Decoder.
 *
 * @param input The string to decode.
 * @returns The decoded string.
 */
export const base64URLDecode = (input: string) => {
  input = input.replace(/-/g, "+").replace(/_/g, "/")
  const padLength = (4 - (input.length % 4)) % 4
  input += "=".repeat(padLength)
  return atob(input)
}
