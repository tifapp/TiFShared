import { removeInsecureProperties } from "./InsecureProperties.ts"

/**
 * Removes all keys that have a value of undefined from the given object.
 */
export const removeUndefined = <Obj extends { [key: string]: any }>(
  obj: Obj
) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  ) as Obj
}

/**
 * Replaces all keys that have a value of undefined with null.
 */
export const undefinedToNull = <Obj extends { [key: string]: any }>(
  obj: Obj
) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, value === undefined ? null : value])
  ) as Obj
}

/**
 * Merges the given object with another partial object of itself, but removes
 * any undefined values from the partial during the merge.
 */
export const mergeWithPartial = <Obj extends { [key: string]: any }>(
  obj: Obj,
  partial: Partial<Obj>
): Obj => {
  return { ...obj, ...removeInsecureProperties(removeUndefined(partial)) }
}
