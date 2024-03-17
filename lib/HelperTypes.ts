/**
 * An interface represented by any given class.
 */
export interface AnyClass {
  new (...args: any): any
}

/**
 * Omits the first argument from the given function type.
 *
 * **Note:** If this type is used on a function with generic arguments, then
 * those arguments will be inferred as unknown.
 */
export type OmitFirstArgument<F> = F extends (
  x: any,
  ...args: infer P
) => infer R
  ? (...args: P) => R
  : never

/**
 * A type representing any variable that is an instance of a class.
 */
export interface AnyClassInstance {
  get constructor(): any
}

/**
 * A simple type for representing a JSON serializable value (ie. It works with `JSON.stringify`).
 */
export type JSONSerializableValue =
  | string
  | number
  | boolean
  | { [key: string | number]: JSONSerializableValue }
  | JSONSerializableValue[]
  | null
  | Date
  | { toJSON: () => JSONSerializableValue }

/**
 * Unions all properties of a given object with `Type`.
 */
export type DeepUnion<Obj, Type> = {
  [K in keyof Obj]: DeepNullable<Obj[K]> | Type
}

/**
 * Unions all properties of a given object with `null`.
 */
export type DeepNullable<Obj> = DeepUnion<Obj, null>

/**
 * Reassigns the type of the given keys the specified type value.
 */
export type Reassign<Obj, Key extends keyof Obj, Type> = {
  [K in keyof Obj]: K extends Key ? Type : Obj[K]
}
