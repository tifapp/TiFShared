import { throwIfInsecurePropertyName } from "./InsecureProperties"

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
 * Merges the given object with another partial object of itself, but removes
 * any undefined values from the partial during the merge.
 */
export const mergeWithPartial = <Obj extends { [key: string]: any }>(
  obj: Obj,
  partial: Partial<Obj>
): Obj => {
  throwIfInsecurePropertyName(partial)
  return { ...obj, ...removeUndefined(partial) }
}
