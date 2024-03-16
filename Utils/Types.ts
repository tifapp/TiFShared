/**
 * Replaces the return type of a function type.
 */
export type ReplaceReturnType<T extends (...a: any) => any, TNewReturn> = (
  ...a: Parameters<T>
) => TNewReturn
