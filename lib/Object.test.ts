import { mergeWithPartial, removeUndefined } from "./Object"

describe("ObjectUtils tests", () => {
  test("remove undefined", () => {
    const obj = { a: 1, b: undefined, c: { deep: undefined } }
    expect(removeUndefined(obj)).toStrictEqual({
      a: 1,
      c: { deep: undefined }
    })
  })

  test("merge with partial", () => {
    const a = { a: 1, b: 2, c: 3 }
    expect(mergeWithPartial(a, { b: 4, c: undefined })).toStrictEqual({
      a: 1,
      b: 4,
      c: 3
    })
  })
})
