import { failure, promiseResult, success } from "./Result"

describe("Result tests", () => {
  const successResult = { status: "success", value: "passed" } as const
  const failureResult = { status: "failure", value: "failed" } as const

  it("should construct a valid success result", () => {
    expect(success("passed" as const)).toMatchObject(successResult)
  })

  it("should observe success results without modifying them", () => {
    const currentSuccess = success("passed" as const)
    currentSuccess.observe((result) => expect(result).toBe("passed"))
    expect(currentSuccess).toMatchObject(successResult)
  })

  it("should allow success results to map to promise results", async () => {
    const promiseSuccess = success("passed" as const).flatMapSuccess(() =>
      promiseResult(failure("failed" as const))
    )
    expect(await promiseSuccess).toMatchObject(failureResult)
  })

  it("should allow success results to pass through a successful result", async () => {
    const promiseSuccess = promiseResult(
      success("originalSuccess" as const)
    ).passthroughSuccess(() => success("conditional" as const))

    expect(await promiseSuccess).toMatchObject({
      status: "success" as const,
      value: "originalSuccess" as const
    })
  })

  it("should not allow success results to pass through a failing result", async () => {
    const promiseSuccess = promiseResult(
      success("originalSuccess" as const)
    ).passthroughSuccess(() => failure("conditional" as const))

    expect(await promiseSuccess).toMatchObject({
      status: "failure" as const,
      value: "conditional" as const
    })
  })

  it("should allow success results to be transformed", () => {
    const currentSuccess = success("passed" as const)
    expect(currentSuccess.withSuccess("newSuccess" as const)).toMatchObject({
      status: "success",
      value: "newSuccess"
    })
    expect(
      currentSuccess.mapSuccess(() => "mappedSuccess" as const)
    ).toMatchObject({
      status: "success",
      value: "mappedSuccess"
    })
    expect(
      currentSuccess.flatMapSuccess(() => failure("failed" as const))
    ).toMatchObject(failureResult)
    expect(currentSuccess.inverted()).toMatchObject({
      status: "failure" as const,
      value: "passed" as const
    })
  })

  it("should not modify success result with failures", () => {
    expect(
      success("passed" as const)
        .withFailure("failed" as const)
        .mapFailure(() => "failed" as const)
        .flatMapFailure(() => failure("failed" as const))
        .passthroughFailure(() => failure("failed" as const))
    ).toMatchObject(successResult)
  })

  it("should construct a valid failure result", () => {
    expect(failure("failed" as const)).toMatchObject(failureResult)
  })

  it("should observe failure results without modifying them", () => {
    const currentFailure = failure("failed" as const)
    currentFailure.observe((result) => expect(result).toBe("failed"))
    expect(currentFailure).toMatchObject(failureResult)
  })

  it("should allow failure results to map to promise results", async () => {
    const promiseFailure = failure("failed" as const).flatMapFailure(() =>
      promiseResult(success("passed" as const))
    )
    expect(await promiseFailure).toMatchObject(successResult)
  })

  it("should allow failure results to pass through a successful result", async () => {
    const promiseFailure = promiseResult(
      failure("originalFailure" as const)
    ).passthroughFailure(() => success("conditional" as const))

    expect(await promiseFailure).toMatchObject({
      status: "failure" as const,
      value: "originalFailure"
    })
  })

  it("should not allow failure results to pass through a failing result", async () => {
    const promiseFailure = promiseResult(
      failure("originalFailure" as const)
    ).passthroughFailure(() => failure("conditional" as const))

    expect(await promiseFailure).toMatchObject({
      status: "failure" as const,
      value: "conditional"
    })
  })

  it("should allow failure results to be transformed", () => {
    const currentFailure = failure("failed" as const)
    expect(currentFailure.withFailure("newFailure")).toMatchObject({
      status: "failure" as const,
      value: "newFailure"
    })
    expect(currentFailure.mapFailure(() => "mappedFailure")).toMatchObject({
      status: "failure" as const,
      value: "mappedFailure"
    })
    expect(
      currentFailure.flatMapFailure(() => success("passed" as const))
    ).toMatchObject(successResult)
    expect(currentFailure.inverted()).toMatchObject({
      status: "success" as const,
      value: "failed" as const
    })
  })

  it("should not modify failure result with successes", () => {
    expect(
      failure("failed" as const)
        .withSuccess("passed" as const)
        .mapSuccess(() => "passed" as const)
        .flatMapSuccess(() => failure("passed" as const))
        .passthroughSuccess(() => failure("passed" as const))
    ).toMatchObject(failureResult)
  })

  it("should construct a valid promise result", async () => {
    expect(
      await promiseResult((async () => success("passed" as const))())
    ).toMatchObject(successResult)
    expect(
      await promiseResult((async () => failure("failed" as const))())
    ).toMatchObject(failureResult)
  })

  it("should allow nested promise results", async () => {
    expect(
      await promiseResult(promiseResult(success("passed" as const)))
    ).toMatchObject(successResult)
    expect(
      await promiseResult(promiseResult(failure("failed" as const)))
    ).toMatchObject(failureResult)
  })

  it("should observe promise results without modifying them", async () => {
    const currentFailure = promiseResult(failure("failed" as const))
    currentFailure.observe((result) => expect(result).toBe("failed"))
    const result = await currentFailure
    expect(result).toMatchObject(failureResult)
  })

  it("should should not observe failure result when successful", async () => {
    const observeFn = jest.fn()
    let currentSuccess = promiseResult(success("passed" as const))
    currentSuccess = currentSuccess.observeFailure(observeFn)
    await currentSuccess
    expect(observeFn).not.toHaveBeenCalled()
  })

  it("should should observe failure without modifying current result", async () => {
    const observeFn = jest.fn()
    const result1 = promiseResult(failure("failed" as const))
    const result2 = result1.observeFailure(observeFn)
    await result2
    expect(result1).toBe(result2)
    expect(observeFn).toHaveBeenCalledWith("failed" as const)
  })

  it("should should not observe success result when failure", async () => {
    const observeFn = jest.fn()
    let currentFailure = promiseResult(failure("failed" as const))
    currentFailure = currentFailure.observeSuccess(observeFn)
    await currentFailure
    expect(observeFn).not.toHaveBeenCalled()
  })

  it("should should observe failure without modifying current result", async () => {
    const observeFn = jest.fn()
    const result1 = promiseResult(success("passed" as const))
    const result2 = result1.observeSuccess(observeFn)
    await result2
    expect(result1).toBe(result2)
    expect(observeFn).toHaveBeenCalledWith("passed" as const)
  })

  it("should allow promise results to be unwrapped", async () => {
    expect(await promiseResult(failure("failed" as const)).unwrap()).toBe(
      "failed"
    )
    expect(await promiseResult(success("passed" as const)).unwrap()).toBe(
      "passed"
    )
    expect(
      await promiseResult(Promise.resolve(failure("failed" as const))).unwrap()
    ).toBe("failed")
    expect(
      await promiseResult(Promise.resolve(success("passed" as const))).unwrap()
    ).toBe("passed")
  })

  it("should allow promise results to be transformed", async () => {
    const currentResult = promiseResult(failure("failed" as const))
    expect(await currentResult.withFailure("newFailure")).toMatchObject({
      status: "failure" as const,
      value: "newFailure"
    })
    expect(await currentResult.mapFailure(() => "mappedFailure")).toMatchObject(
      { status: "failure" as const, value: "mappedFailure" }
    )
    expect(
      await currentResult.flatMapFailure(() => success("passed" as const))
    ).toMatchObject(successResult)
    expect(
      await currentResult.inverted().withSuccess("newSuccess")
    ).toMatchObject({ status: "success" as const, value: "newSuccess" })
    expect(
      await currentResult.inverted().mapSuccess(() => "mappedSuccess")
    ).toMatchObject({ status: "success" as const, value: "mappedSuccess" })
    expect(
      await currentResult
        .inverted()
        .flatMapSuccess(() => failure("failed" as const))
    ).toMatchObject(failureResult)
  })
})
