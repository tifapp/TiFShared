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
 * Asserts that a function matches an expected function definition.
 * 
 * @typeParam ExpectedFn - An expected function signature.
 * @returns The function that should conform to ExpectedFn.
 */
export type MatchFn<ExpectedFn extends (...args: any[]) => any, TFn extends ExpectedFn>
  = Match<Awaited<ReturnType<ExpectedFn>>, Awaited<ReturnType<TFn>>, TFn>

// Example Usage:
const assertFnType = <ExpectedFn extends (...args: any[]) => any>() => {
  return <Fn extends ExpectedFn>(fns: MatchFn<ExpectedFn, Fn>) => fns;
}

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
  return { status: 204, data: "no-content" };
});

// Warning:
//
// type ExpectedFn = () => {data: {status: "friends" | "blocked"}}
// export const testfn = <Fns extends ExpectedFn>(_: MatchFn<ExpectedFn, Fns>) => {}
// testfn(() => {
//   if (Math.random()) {
//     return {data: {status: "friends"}}
//   } else {
//     return {data: {status: "blocked"}}
//   }
// })
//
// In this example, the expected return type is { data: { status: "friends" | "blocked" } }
// However, the actual function returns a union of separate objects:
//   { data: { status: "friends" } } | { data: { status: "blocked" } }
// 
// TypeScript treats these two types as distinct because:
// - { data: { status: "friends" | "blocked" } } 
//   is a single object where 'status' can be either "friends" or "blocked".
// - { data: { status: "friends" } } | { data: { status: "blocked" } } 
//   is a union of two separate objects, each with a specific 'status'.

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