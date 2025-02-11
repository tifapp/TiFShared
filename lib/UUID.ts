const mathRandomUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0
    const value = char === "x" ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

/**
 * A function to generate a uuid v4 string.
 *
 * If node's crypto module is available, then it is used, otherwise a Math.random implementation is
 * used. Therefore, this should not be used for purposes of security.
 */
export const uuidString = (() => {
  try {
    return require("crypto").randomUUID as () => string
  } catch {
    return mathRandomUUID
  }
})()
