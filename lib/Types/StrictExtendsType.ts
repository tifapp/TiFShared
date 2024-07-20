import { Tagged } from "./HelperTypes";

type StrictExtendsError<T> = Tagged<T, "StrictExtendsError">

export type StrictExtends<T, U> = (keyof U extends keyof T ? U : StrictExtendsError<{ error: 'Extra elements'; extra: Exclude<keyof U, keyof T> }>) & U;

// Example Usage:
type Person = {
  name: string;
  age: number;
  occupation: string;
};

// If x is not a complete subset of y, z will resolve to an error type with details
type z = StrictExtends<{name: string}, Person>;