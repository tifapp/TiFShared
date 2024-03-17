/**
 * Replaces the return type of a function type.
 */
export type ReplaceReturnType<T extends (...a: any) => any, TNewReturn> = (
  ...a: Parameters<T>
) => TNewReturn

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
