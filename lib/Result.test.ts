import { failure, promiseResult, success } from "./Result"

describe("Result tests", () => {
  const successResult = { status: "success", value: "passed" }
  const failureResult = { status: "failure", value: "failed"}

  it("should construct a valid success result", () => {
    expect(success("passed")).toMatchObject(successResult)
  })

  it("should observe success results without modifying them", () => {
    const currentSuccess = success("passed")
    currentSuccess.observe((result) => expect(result).toBe("passed"))
    expect(currentSuccess).toMatchObject(successResult)
  })

  it("should allow success results to map to promise results", async () => {
    const promiseSuccess = success("passed").flatMapSuccess(() =>
      promiseResult(failure("failed"))
    )
    expect(await promiseSuccess).toMatchObject(failureResult)
  })
  
  it("should allow success results to pass through a successful result", async () => {
    const promiseSuccess = promiseResult(success("originalSuccess")).passthroughSuccess(() =>
      success("conditional")
    )

    expect(await promiseSuccess).toMatchObject({
      status: "success",
      value: "originalSuccess"
    })
  })
  
  it("should not allow success results to pass through a failing result", async () => {
    const promiseSuccess = promiseResult(success("originalSuccess")).passthroughSuccess(() =>
      failure("conditional")
    )

    expect(await promiseSuccess).toMatchObject({
      status: "failure",
      value: "conditional"
    })
  })

  it("should allow success results to be transformed", () => {
    const currentSuccess = success("passed")
    expect(currentSuccess.withSuccess("newSuccess")).toMatchObject({
      status: "success",
      value: "newSuccess"
    })
    expect(currentSuccess.mapSuccess(() => "mappedSuccess")).toMatchObject({
      status: "success",
      value: "mappedSuccess"
    })
    expect(
      currentSuccess.flatMapSuccess(() => failure("failed"))
    ).toMatchObject(failureResult)
    expect(currentSuccess.inverted()).toMatchObject({
      status: "failure",
      value: "passed"
    })
  })

  it("should not modify success result with failures", () => {
    expect(
      success("passed")
        .withFailure("failed")
        .mapFailure(() => "failed")
        .flatMapFailure(() => failure("failed"))
        .passthroughFailure(() => failure("failed"))
    ).toMatchObject(successResult)
  })

  it("should construct a valid failure result", () => {
    expect(failure("failed")).toMatchObject(failureResult)
  })

  it("should observe failure results without modifying them", () => {
    const currentFailure = failure("failed")
    currentFailure.observe((result) => expect(result).toBe("failed"))
    expect(currentFailure).toMatchObject(failureResult)
  })

  it("should allow failure results to map to promise results", async () => {
    const promiseFailure = failure("failed").flatMapFailure(() =>
      promiseResult(success("passed"))
    )
    expect(await promiseFailure).toMatchObject(successResult)
  })
  
  it("should allow failure results to pass through a successful result", async () => {
    const promiseFailure = promiseResult(failure("originalFailure")).passthroughFailure(() =>
      success("conditional")
    )

    expect(await promiseFailure).toMatchObject({
      status: "failure",
      value: "originalFailure"
    })
  })
  
  it("should not allow failure results to pass through a failing result", async () => { 
    const promiseFailure = promiseResult(failure("originalFailure")).passthroughFailure(() =>
      failure("conditional")
    )

    expect(await promiseFailure).toMatchObject({
      status: "failure",
      value: "conditional"
    })
  })

  it("should allow failure results to be transformed", () => {
    const currentFailure = failure("failed")
    expect(currentFailure.withFailure("newFailure")).toMatchObject({
      status: "failure",
      value: "newFailure"
    })
    expect(currentFailure.mapFailure(() => "mappedFailure")).toMatchObject({
      status: "failure",
      value: "mappedFailure"
    })
    expect(
      currentFailure.flatMapFailure(() => success("passed"))
    ).toMatchObject(successResult)
    expect(currentFailure.inverted()).toMatchObject({
      status: "success",
      value: "failed"
    })
  })

  it("should not modify failure result with successes", () => {
    expect(
      failure("failed")
        .withSuccess("passed")
        .mapSuccess(() => "passed")
        .flatMapSuccess(() => failure("passed"))
        .passthroughSuccess(() => failure("passed"))
    ).toMatchObject(failureResult)
  })

  it("should construct a valid promise result", async () => {
    expect(await promiseResult((async () => success("passed"))())).toMatchObject(successResult)
    expect(await promiseResult((async () => failure("failed"))())).toMatchObject(failureResult)
  })

  it("should allow nested promise results", async () => {
    expect(await promiseResult(promiseResult(success("passed")))).toMatchObject(successResult)
    expect(await promiseResult(promiseResult(failure("failed")))).toMatchObject(failureResult)
  })

  it("should observe promise results without modifying them", async () => {
    const currentFailure = promiseResult(failure("failed"))
    currentFailure.observe((result) => expect(result).toBe("failed"))
    const result = await currentFailure
    expect(result).toMatchObject(failureResult)
  })

  it("should should not observe failure result when successful", async () => {
    const observeFn = jest.fn()
    let currentSuccess = promiseResult(success("passed"))
    currentSuccess = currentSuccess.observeFailure(observeFn)
    await currentSuccess
    expect(observeFn).not.toHaveBeenCalled()
  })

  it("should should observe failure without modifying current result", async () => {
    const observeFn = jest.fn()
    const result1 = promiseResult(failure("failed"))
    const result2 = result1.observeFailure(observeFn)
    await result2
    expect(result1).toBe(result2)
    expect(observeFn).toHaveBeenCalledWith("failed")
  })

  it("should should not observe success result when failure", async () => {
    const observeFn = jest.fn()
    let currentFailure = promiseResult(failure("failed"))
    currentFailure = currentFailure.observeSuccess(observeFn)
    await currentFailure
    expect(observeFn).not.toHaveBeenCalled()
  })

  it("should should observe failure without modifying current result", async () => {
    const observeFn = jest.fn()
    const result1 = promiseResult(success("passed"))
    const result2 = result1.observeSuccess(observeFn)
    await result2
    expect(result1).toBe(result2)
    expect(observeFn).toHaveBeenCalledWith("passed")
  })
  
  it("should allow promise results to be unwrapped", async () => {
    expect(await promiseResult(failure("failed")).unwrap()).toBe("failed")
    expect(await promiseResult(success("passed")).unwrap()).toBe("passed")
  })

  it("should allow promise results to be transformed", async () => {
    const currentResult = promiseResult(failure("failed"))
    expect(await currentResult.withFailure("newFailure")).toMatchObject({
      status: "failure",
      value: "newFailure"
    })
    expect(await currentResult.mapFailure(() => "mappedFailure")).toMatchObject(
      { status: "failure", value: "mappedFailure" }
    )
    expect(
      await currentResult.flatMapFailure(() => success("passed"))
    ).toMatchObject(successResult)
    expect(
      await currentResult.inverted().withSuccess("newSuccess")
    ).toMatchObject({ status: "success", value: "newSuccess" })
    expect(
      await currentResult.inverted().mapSuccess(() => "mappedSuccess")
    ).toMatchObject({ status: "success", value: "mappedSuccess" })
    expect(
      await currentResult.inverted().flatMapSuccess(() => failure("failed"))
    ).toMatchObject(failureResult)
  })
})
