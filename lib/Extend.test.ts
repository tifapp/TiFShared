import {
  ExtendedPropertyExistsError,
  UnableToExtendPrototypeError,
  extension,
  protoypeExtension
} from "./Extend"
import "./Array"
import { insecurePropertiesTest } from "../test-helpers/InsecurePropertiesTest"

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
    insecurePropertiesTest((name) => {
      extension({}, { [name]: () => {} })
    })
  })

  it("should throw an error when trying to add an extension name that is already on the class", () => {
    class Test {
      foo() {}
    }
    expect(() => protoypeExtension(Test, { foo: () => {} })).toThrow(
      ExtendedPropertyExistsError
    )
  })

  it("should throw an error when trying to add a prototype extension name that is insecure", () => {
    class Test2 {
      foo() {}
    }
    insecurePropertiesTest((name) => {
      protoypeExtension(Test2, { [name]: () => {} })
    })
  })

  it("should throw an error when trying to override pre-existing extensions", () => {
    class Test3 {}
    protoypeExtension(Test3, { foo: () => {} })
    expect(() => protoypeExtension(Test3, { foo: (t) => t })).toThrow(
      ExtendedPropertyExistsError
    )
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
    expect(() => extension({ hello: "world" }, { hello: () => {} })).toThrow(
      ExtendedPropertyExistsError
    )
  })

  it("should throw an error when trying to extend already defined properties on an object", () => {
    const obj = {}
    Object.defineProperty(obj, "hello", {
      writable: true,
      value: "world"
    })
    expect(() => extension(obj, { hello: () => {} })).toThrow(
      ExtendedPropertyExistsError
    )
  })

  it("should throw an error when trying to extend a prototype with an ext property", () => {
    class Test5 {
      ext() {}
    }
    expect(() => protoypeExtension(Test5, {})).toThrow(
      UnableToExtendPrototypeError
    )
  })
})
