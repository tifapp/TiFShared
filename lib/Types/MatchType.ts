import { Tagged } from "./HelperTypes";

type MatchError<T> = Tagged<T, "MatchError">

/**
 * Compares two union types to check if they are equivalent, providing detailed error messages if not.
 * 
 * @typeParam T - The expected type.
 * @typeParam U - The actual type being compared.
 * @typeParam V - The resulting type if T and U match. Defaults to U.
 * @returns Either the type V if T and U match, or a detailed error type with differences.
 */
export type Match<T, U, V = U> = 
  [T] extends [U] ? 
    ([U] extends [T] ? 
      V : MatchError<{ error: 'Extra elements'; extra: Exclude<U, T>; }>
    ) 
  : MatchError<{ error: 'Missing elements'; missing: Exclude<T, U>; }>;

// Example Usage:
type x = 'a' | 'b';
type y = 'a';

// If x is not a complete subset of y, z will resolve to an error type with details
type z = Match<x, y>;

// z will detail the missing type ('c' in this case).

/**
 * Asserts that a given function matches an expected function definition, including parameter and return types.
 * 
 * @typeParam ExpectedFn - The expected function signature.
 * @returns The function itself if it matches the ExpectedFn type, throwing a compile error if not.
 */
export const assertFnType = <ExpectedFn extends (...args: any[]) => any>() => 
  <F extends ExpectedFn>(
    fn: F & Match<ReturnType<ExpectedFn>, ReturnType<F>, F>
  ) =>
    fn

// Example Usage:
type ExampleFnType = (param: string, param2: string) => {
  status: 204,
  data: "no-content"
} | {
  status: 201,
  data: number
}

// If fn does not return all possible values from ExampleFnType, a compile error will be thrown
const fn = assertFnType<ExampleFnType>()((param, param2) => { // Params are correctly inferred to match ExampleFnType
  if (param) {
    return { status: 201, data: 3 };
  }
  return { status: 204, data: "no-content" }; // No need to specify "as const"
});

/**
 * Asserts that a function matches an expected function definition.
 * 
 * @typeParam ExpectedFn - An expected function signature.
 * @returns The function that should conform to ExpectedFn.
 */
export type MatchFn<ExpectedFn extends (...args: any[]) => any, TFn extends ExpectedFn>
  = Match<ReturnType<ExpectedFn>, ReturnType<TFn>, TFn> & TFn

/**
 * Asserts that a collection of functions matches an expected set of function definitions.
 * 
 * @typeParam ExpectedFns - A record type mapping function names to their expected signatures.
 * @returns The collection of functions that should conform to ExpectedFns.
 */
export type MatchFnCollection<ExpectedFns extends Record<string, (...args: any[]) => any>, TFns extends ExpectedFns>
  = {
    [K in keyof ExpectedFns & keyof TFns]: MatchFn<ExpectedFns[K], TFns[K]>
  }

// Example usage:
type ExampleFnTypeCollection = {
  fn1: (param: string, param2: string) => {
      status: 204,
      data: string
  } | {
      status: 201,
      data: number
  },
  fn2: (x: number) => number
};

const assertFnCollectionType = <ExpectedFns extends Record<string, (...args: any[]) => any>>() => {
  return <Fns extends ExpectedFns>(fns: MatchFnCollection<ExpectedFns, Fns>) => fns;
}

// If fnCollection does not properly describe all fns from ExampleFnTypeCollection, a compile error will be thrown
const fnCollection = assertFnCollectionType<ExampleFnTypeCollection>()({
  fn1: (param, param2) => {
      if (param) {
          return { status: 201, data: 3 };
      }
      return { status: 204, data: "no-content" };
  },
  fn2: (x) => x * 2
});