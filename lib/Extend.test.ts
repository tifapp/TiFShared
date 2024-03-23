import { extension, protoypeExtension } from "./Extend"
import "./Array"

describe("Extension tests", () => {
  test("extending basic type", () => {
    class Thing {
      prop = 1
    }
    const thing = extension(new Thing(), { double: (t) => t.prop * 2 })
    expect(thing.double()).toEqual(2)
  })

  it("should return the same reference to the array", () => {
    const nums = [1, 2, 3, 4]
    expect(nums).toBe(nums.ext)
  })

  it("should return the same reference to the array with multiple extensions", () => {
    const nums = [1, 2, 3, 4]
    expect(nums).toBe(nums.ext.ext.ext)
  })

  it("should throw an error, if an insecure extension name is used", () => {
    const expectThrows = (name: string) => {
      expect(() => extension({}, { [name]: () => {} })).toThrow()
    }
    expectThrows("constructor")
    expectThrows("prototype")
  })

  it("should throw an error when trying to add an extension name that is already on the class", () => {
    class Test {
      foo() {}
    }
    expect(() => protoypeExtension(Test, { foo: () => {} })).toThrow()
  })

  it("should throw an error when trying to add a prototype extension name that is insecure", () => {
    class Test2 {
      foo() {}
    }
    const expectThrows = (name: string) => {
      expect(() => protoypeExtension(Test2, { [name]: () => {} })).toThrow()
    }
    expectThrows("prototype")
    expectThrows("constructor")
  })

  it("should throw an error when trying to override pre-existing extensions", () => {
    class Test3 {}
    protoypeExtension(Test3, { foo: () => {} })
    expect(() => protoypeExtension(Test3, { foo: (t) => t })).toThrow()
  })

  it("should allow multiple prototype extensions", () => {
    class Test4 {}
    protoypeExtension(Test4, { foo: () => 1 })
    protoypeExtension(Test4, { bar: () => 2 })
    const t = new Test4() as any
    expect(t.ext.foo()).toEqual(1)
    expect(t.ext.bar()).toEqual(2)
  })

  it("should throw an error when trying to extend already existing properties on an object", () => {
    expect(() => extension({ hello: "world" }, { hello: () => {} })).toThrow()
  })

  it("should throw an error when trying to extend already defined properties on an object", () => {
    const obj = {}
    Object.defineProperty(obj, "hello", {
      writable: true,
      value: "world"
    })
    expect(() => extension(obj, { hello: () => {} })).toThrow()
  })
})
