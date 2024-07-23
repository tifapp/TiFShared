/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

/**
 * A type representing an "expected" success or failure of an operation.
 *
 * Unexpected outcomes can still be thrown as exceptions, because they are exceptions to what we expect.
 *
 * For instance, an expected failure could be that a particular record in the database cannot be found.
 * We won't, however, expect that a meteor would destroy the database.
 * That can be handled with a try catch or bubbled up with a 500.
 */
export type Result<Success, Failure> =
  | SuccessResult<Success, Failure>
  | FailureResult<Success, Failure>

export type AwaitableResult<Success, Failure> =
  | Result<Success, Failure>
  | PromiseResult<Success, Failure>

/**
 * A result representing the success of an operation.
 */
export class SuccessResult<Success, Failure> {
  status = "success" as const

  constructor(public value: Success) {
    this.value = value
  }

  /**
   * Observes the result without modifying it.
   *
   * @param handler a function to observe the value and perform a side effect.
   */
  observe(handler: (value: Success) => void) {
    handler(this.value)
    return this
  }

  /**
   * Runs the handler with the given success value if the result returns a
   * successful value.
   *
   * @param handler a function to observe the value and perform a side effect.
   */
  observeSuccess(handler: (value: Success) => void) {
    this.observe(handler)
    return this
  }

  /**
   * Runs the handler with the given success value if the result returns a
   * failure value.
   *
   * @param handler a function to observe the value and perform a side effect.
   */
  observeFailure(_: (value: Failure) => void) {
    return this
  }

  /**
   * Runs the handler with the current success value and passes the current success value through
   * if the handler is successful.
   *
   * @param handler a function to process the current success value and either passthrough the value or return a failure.
   */
  passthroughSuccess<NewSuccess, NewFailure>(
    handler: (value: Success) => AwaitableResult<NewSuccess, NewFailure>
  ): AwaitableResult<Success, NewFailure | Failure> {
    return handler(this.value).withSuccess(this.value)
  }
  
  /**
   * Runs the handler with the current failure value and passes the current failure value through
   * if the handler is successful.
   *
   * @param handler a function to process the current failure value and either passthrough the value or return a failure.
   */
  passthroughFailure<NewSuccess, NewFailure>(_: (value: Failure) => AwaitableResult<NewSuccess, NewFailure>) {
    return this as unknown as AwaitableResult<Success, NewFailure | Failure>
  }

  /**
   * Transforms the success result into an entirely new result.
   *
   * @param mapper a function to transform the current result into a new result.
   */
  flatMapSuccess<NewSuccess, NewFailure>(
    mapper: (value: Success) => AwaitableResult<NewSuccess, NewFailure>
  ): AwaitableResult<NewSuccess, Failure | NewFailure> {
    const result = mapper(this.value)
    return result
  }

  /**
   * Returns this result typecasted as the success type unioned with the success
   * type and failure type returned from the given mapper function.
   */
  flatMapFailure<NewSuccess, NewFailure>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: (value: Failure) => AwaitableResult<NewSuccess, NewFailure>
  ) {
    return this as unknown as SuccessResult<Success | NewSuccess, NewFailure>
  }

  /**
   * Maps the current success value to a new one lazily.
   *
   * @param mapper a function to transform the current success value to a new success result.
   */
  mapSuccess<NewSuccess>(mapper: (value: Success) => NewSuccess) {
    return success(mapper(this.value)) as SuccessResult<NewSuccess, Failure>
  }

  /**
   * Returns the failure result typecasted as the failure type returned from the map function.
   */
  mapFailure<NewFailure>(_: (value: Failure) => NewFailure) {
    return this as unknown as SuccessResult<Success, NewFailure>
  }

  /**
   * Returns the failure result typecasted as the new failure type.
   */
  withFailure<NewFailure>(_: NewFailure) {
    return this as unknown as SuccessResult<Success, NewFailure>
  }

  /**
   * Sets the success result to the new value.
   */
  withSuccess<NewSuccess>(value: NewSuccess) {
    return success(value)
  }

  /**
   * Inverts this result to a failure result with the current value being treated as the new failure value.
   */
  inverted() {
    return failure(this.value) as FailureResult<Failure, Success>
  }
  
  /**
   * Returns the result value.
   */
  unwrap() {
    return this.value
  }
}

/**
 * A result representing the failure of an operation.
 */
export class FailureResult<Success, Failure> {
  status = "failure" as const

  constructor(public value: Failure) {
    this.value = value
  }

  /**
   * Observes the result without modifying it.
   *
   * @param handler a function to observe the value and perform a side effect.
   */
  observe(handler: (value: Failure) => void) {
    handler(this.value)
    return this
  }

  /**
   * Runs the handler with the given success value if the result returns a
   * successful value.
   *
   * @param handler a function to observe the value and perform a side effect.
   */
  observeSuccess(_: (value: Success) => void) {
    return this
  }

  /**
   * Runs the handler with the given success value if the result returns a
   * failure value.
   *
   * @param handler a function to observe the value and perform a side effect.
   */
  observeFailure(handler: (value: Failure) => void) {
    this.observe(handler)
    return this
  }
  
  /**
   * Runs the handler with the current success value and passes the current success value through
   * if the handler is successful.
   *
   * @param handler a function to process the current success value and either passthrough the value or return a failure.
   */
  passthroughSuccess<NewSuccess, NewFailure>(_: (value: Success) => AwaitableResult<NewSuccess, NewFailure>) {
    return this as unknown as AwaitableResult<Success, NewFailure | Failure>
  }
  
  /**
   * Runs the handler with the current failure value and passes the current failure value through
   * if the handler is successful.
   *
   * @param handler a function to process the current failure value and either passthrough the value or return a failure.
   */
  passthroughFailure<NewSuccess, NewFailure>(
    handler: (value: Failure) => AwaitableResult<NewSuccess, NewFailure>
  ): AwaitableResult<Success, NewFailure | Failure> {
    return handler(this.value).flatMapSuccess(() => failure(this.value))
  }

  /**
   * Returns this result typecasted as the failure type unioned with the success
   * type and failure type returned from the given mapper function.
   */
  flatMapSuccess<NewSuccess, NewFailure>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: (value: Success) => AwaitableResult<NewSuccess, NewFailure>
  ) {
    return this as unknown as FailureResult<NewSuccess, Failure | NewFailure>
  }

  /**
   * Transforms the failure result into an entirely new result.
   *
   * @param mapper a function to transform the current result into a new result.
   */
  flatMapFailure<NewSuccess, NewFailure>(
    mapper: (value: Failure) => AwaitableResult<NewSuccess, NewFailure>
  ): AwaitableResult<Success | NewSuccess, NewFailure> {
    return mapper(this.value)
  }

  /**
   * Returns the success result typecasted as the success type returned from the map function.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mapSuccess<NewSuccess>(_: (value: Success) => NewSuccess) {
    return this as unknown as FailureResult<NewSuccess, Failure>
  }

  /**
   * Maps the current failure value to a new one lazily.
   */
  mapFailure<NewFailure>(mapper: (value: Failure) => NewFailure) {
    return failure(mapper(this.value)) as FailureResult<Success, NewFailure>
  }

  /**
   * Sets the failure result to a new value.
   */
  withFailure<NewFailure>(value: NewFailure) {
    return failure(value)
  }

  /**
   * Returns the success result typecasted as the new success type.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  withSuccess<NewSuccess>(_: NewSuccess) {
    return this as unknown as FailureResult<NewSuccess, Failure>
  }

  /**
   * Inverts this result to a success result with the current value being treated as the new success value.
   */
  inverted() {
    return success(this.value) as SuccessResult<Failure, Success>
  }
  
  /**
   * Returns the result value.
   */
  unwrap() {
    return this.value
  }
}

/**
 * A class that can handle promises of {@link Result}s like normal synchronous results.
 */
export class PromiseResult<Success, Failure> extends Promise<
  Result<Success, Failure>
> {
  constructor(executor) {
    if (typeof executor !== "function") {
      throw new TypeError("Promise resolver " + executor + " is not a function")
    }
    super(executor)
  }

  /**
   * Waits for the promiseResult to settle, then observes the result without modifying it.
   *
   * @param handler a function to observe the value and perform a side effect.
   */
  observe(handler: (value: Success | Failure) => void) {
    this.then((result) => result.observe(handler))
    return this
  }

  /**
   * Waits for the promiseResult to settle, then runs the handler with the
   * given success value if the result returns a successful value.
   *
   * @param handler a function to observe the value and perform a side effect.
   */
  observeSuccess(handler: (value: Success) => void) {
    this.then((result) => result.observeSuccess(handler))
    return this
  }

  /**
   * Waits for the promiseResult to settle, then runs the handler with the
   * given failure value if the result returns a failure value.
   *
   * @param handler a function to observe the value and perform a side effect.
   */
  observeFailure(handler: (value: Failure) => void) {
    this.then((result) => result.observeFailure(handler))
    return this
  }
  
  /**
   * Runs the handler with the current success value and passes the current success value through
   * if the handler is successful.
   *
   * @param handler a function to process the current success value and either passthrough the value or return a failure.
   */
  passthroughSuccess<NewSuccess, NewFailure>(
    handler: (value: Success) => AwaitableResult<NewSuccess, NewFailure>
  ): AwaitableResult<Success, Failure | NewFailure> {
    return promiseResult(this.then((result) => result.passthroughSuccess(handler)))
  }

  /**
   * Runs the handler with the current failure value and passes the current failure value through
   * if the handler is successful.
   *
   * @param handler a function to process the current failure value and either passthrough the value or return a failure.
   */
  passthroughFailure<NewSuccess, NewFailure>(
    handler: (value: Failure) => AwaitableResult<NewSuccess, NewFailure>
  ): AwaitableResult<NewSuccess, Failure | NewFailure> {
    return promiseResult(this.then((result) => result.passthroughFailure(handler)))
  }

  /**
   * Transforms the success result into a {@link PromiseResult} where the underlying result is returned from the map function.
   *
   * @param mapper a function to map the success value into a new result.
   */
  flatMapSuccess<NewSuccess, NewFailure>(
    mapper: (value: Success) => AwaitableResult<NewSuccess, NewFailure>
  ): PromiseResult<NewSuccess, Failure | NewFailure> {
    return promiseResult(this.then((result) => result.flatMapSuccess(mapper)))
  }

  /**
   * Transforms the failure result into a {@link PromiseResult} where the underlying result is returned from the map function.
   *
   * @param mapper a function to map the failure value into a new result.
   */
  flatMapFailure<NewSuccess, NewFailure>(
    mapper: (value: Failure) => AwaitableResult<NewSuccess, NewFailure>
  ) {
    return promiseResult(this.then((result) => result.flatMapFailure(mapper)))
  }

  /**
   * Transforms the success value into a new one lazily.
   */
  mapSuccess<NewSuccess>(mapper: (value: Success) => NewSuccess) {
    return promiseResult(this.then((result) => result.mapSuccess(mapper)))
  }

  /**
   * Transforms the failure value into a new one lazily.
   */
  mapFailure<NewFailure>(mapper: (value: Failure) => NewFailure) {
    return promiseResult(this.then((result) => result.mapFailure(mapper)))
  }

  /**
   * If this result is successful, inverts this result into an unsuccessful one and vice-versa.
   */
  inverted() {
    return promiseResult(this.then((res) => res.inverted()))
  }

  /**
   * Sets the failure value to the given value eagerly.
   */
  withFailure<NewFailure>(value: NewFailure) {
    return promiseResult(this.then((result) => result.withFailure(value)))
  }

  /**
   * Sets the success value to the given value eagerly.
   */
  withSuccess<NewSuccess>(value: NewSuccess) {
    return promiseResult(this.then((result) => result.withSuccess(value)))
  }
  
  /**
   * Returns the result value.
   */
  unwrap() {
    return this.then((res) => res.value)
  }
}

/**
 * Wraps a result into a {@link PromiseResult}.
 */
export const promiseResult = <Success, Failure>(
  promise: Promise<Result<Success, Failure>> | Result<Success, Failure>
): PromiseResult<Success, Failure> => {
  if (promise instanceof PromiseResult) {
    return promise;
  }

  if (promise instanceof Promise) {
    Object.setPrototypeOf(promise, PromiseResult.prototype);
    return promise as PromiseResult<Success, Failure>;
  }

  return new PromiseResult<Success, Failure>((resolve) => {
    resolve(promise);
  });
};

/**
 * Extracts the success value of a given result. Ex.
 * 
 * ```ts
 * const getUser = (user: {name: string, id: number}) =>
 *  success(user)
 *    .mapSuccess(({ name, id }) => ({ name, id, newField: `${name}${id}` }))
 * 
 * type transformedUserType = ExtractSuccess<ReturnType<typeof getUser>>
 * //transformedUserType is derived as {name: string, id: number, newField: string}
 * ```
 */
export type ExtractSuccess<T> = T extends AwaitableResult<infer U, any> ? U : never;

/**
 * Extracts the failure value of a given result. See {@link ExtractSuccess}
 */
export type ExtractFailure<T> = T extends AwaitableResult<any, infer U> ? U : never;

/**
 * Extracts the success value of a given result. Ex.
 * 
 * ```ts
 * const getUser = (user: {name: string, id: number}) =>
 *  success(user)
 *    .mapSuccess(({ name, id }) => ({ name, id, newField: `${name}${id}` }))
 * 
 * type transformedUserType = ExtractSuccess<ReturnType<typeof getUser>>
 * //transformedUserType is derived as {name: string, id: number, newField: string}
 * ```
 */
export type ExtractSuccess<T> = T extends AwaitableResult<infer U, any> ? U : never;

/**
 * Extracts the failure value of a given result. See {@link ExtractSuccess}
 */
export type ExtractFailure<T> = T extends AwaitableResult<infer U, any> ? U : never;

/**
 * Creates a {@link SuccessResult} with the given value.
 */
export function success(): SuccessResult<undefined, never>
export function success<Success>(value: Success): SuccessResult<Success, never>
export function success<Success>(value?: Success) {
  if (!value) return new SuccessResult<undefined, never>(undefined)
  return new SuccessResult<Success, never>(value)
}

/**
 * Creates a {@link FailureResult} with the given value.
 */
export function failure(): FailureResult<never, undefined>
export function failure<Failure>(value: Failure): FailureResult<never, Failure>
export function failure<Failure>(value?: Failure) {
  if (!value) return new FailureResult<never, undefined>(undefined)
  return new FailureResult<never, Failure>(value)
}
