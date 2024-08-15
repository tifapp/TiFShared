/**
 * Replace the property of a type
 */
export type Overwrite<T, U> = Omit<T, keyof U> & U;

/**
 * Similar to Array, but it requires at least one element to exist
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Similar to Partial, but it requires at least one property to exist
 */
export type NonEmptyPartial<T, U = {[K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

/**
 * Makes all properties of a type optional (null OR undefined).
 */
export type NullablePartial<T> = {
  [P in keyof T]?: T[P] | null;
};

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

/**
 * A helper type for creating strongly typed ids.
 *
 * Ex.
 * ```ts
 * type FooID = Tagged<number, "foo">
 * type BarID = Tagged<number, "bar">
 * const id1: FooID = 1 // ✅ Valid.
 * const id2: BarID = id1 // 🔴 Type Error.
 * ```
 */
export type Tagged<T, Tag extends string> = T & { _tag?: Tag }

