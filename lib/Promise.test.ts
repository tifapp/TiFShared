import { pollyfillPromise } from "./Promise"

describe("PromiseExtended tests", () => {
  describe("PromiseAllSettledPollyfill tests", () => {
    const allSettled = Promise.allSettled
    beforeAll(() => {
      // @ts-nocheck
      const p = Promise as any
      p.allSettled = undefined
      pollyfillPromise()
    })

    afterAll(() => {
      Promise.allSettled = allSettled
    })

    test("await settlement, basic", async () => {
      const p1 = Promise.resolve("Hello")
      const p2 = Promise.reject("World")
      const results = await Promise.allSettled([p1, p2])
      expect(results).toEqual([
        { status: "fulfilled", value: "Hello" },
        { status: "rejected", reason: "World" }
      ])
    })

    test("await settlement, only settles when all promises are finished", async () => {
      let resolve: (() => void) | undefined
      const p1 = new Promise<void>((res) => (resolve = res))
      const p2 = p1.then(() => "nice")
      const results = Promise.allSettled([p1, p2])

      resolve?.()

      expect(await results).toEqual([
        { status: "fulfilled" },
        { status: "fulfilled", value: "nice" }
      ])
    })
  })
})
