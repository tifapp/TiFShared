/**
 * An interface represented by any given class.
 */
export interface AnyClass {
  new (...args: any): any
}

/**
 * Omits the first argument from the given function type.
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
