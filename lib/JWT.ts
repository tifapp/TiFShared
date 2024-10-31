/**
 * Parses and returns an object containing the body of a JWT without verifying its signature.
 *
 * Do not use this function as the sole-validator of the contents of a JWT, because it does not
 * verify the token signature.
 *
 * @param jwt The JWT to parse.
 * @returns An object of the body if `jwt` is a valid jwt, or undefined otherwise.
 */
export const jwtBody = (jwt: string): unknown | undefined => {
  const indicies = [] as number[]
  for (let i = 0; i < jwt.length; i++) {
    if (jwt[i] === ".") indicies.push(i)
  }
  if (indicies.length !== 2) return undefined
  const bodyBase64 = jwt.substring(indicies[0] + 1, indicies[1])
  return JSON.parse(atob(bodyBase64.replace(/-/g, "+").replace(/_/g, "/")))
}
