export const shallowEquals = (objA: any, objB: any) => {
  if (objA === objB) return true

  if (
    typeof objA !== "object" ||
    objA === null ||
    typeof objB !== "object" ||
    objB === null
  ) {
    return false
  }

  if (Array.isArray(objA) !== Array.isArray(objB)) return false

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) return false

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i]
    if (
      !Object.prototype.hasOwnProperty.call(objB, key) ||
      objA[key] !== objB[key]
    ) {
      return false
    }
  }

  return true
}
