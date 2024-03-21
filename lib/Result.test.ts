import { failure, promiseResult, success } from "./Result"

describe("Result tests", () => {
  const successResult = { status: "success", value: "passed" }

  it("should construct a valid success result", () => {
    expect(success("passed")).toMatchObject(successResult)
  })

  it("should observe success results without modifying them", () => {
    const currentSuccess = success("passed")
    currentSuccess.observe((result) => expect(result).toBe("passed"))
    expect(currentSuccess).toMatchObject(currentSuccess)
  })

  it("should allow success results to map to promise results", async () => {
    const promiseSuccess = success("passed").flatMapSuccess(() =>
      promiseResult(failure("failed"))
    )
    expect(await promiseSuccess).toMatchObject({
      status: "failure",
      value: "failed"
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
    ).toMatchObject({ status: "failure", value: "failed" })
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
    ).toMatchObject(successResult)
  })

  const failedResult = { status: "failure", value: "failed" }

  it("should construct a valid failure result", () => {
    expect(failure("failed")).toMatchObject(failedResult)
  })

  it("should observe failure results without modifying them", () => {
    const currentFailure = failure("failed")
    currentFailure.observe((result) => expect(result).toBe("failed"))
    expect(currentFailure).toMatchObject(currentFailure)
  })

  it("should allow failure results to map to promise results", async () => {
    const promiseFailure = failure("failed").flatMapFailure(() =>
      promiseResult(success("passed"))
    )
    expect(await promiseFailure).toMatchObject({
      status: "success",
      value: "passed"
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
    ).toMatchObject({ status: "success", value: "passed" })
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
    ).toMatchObject(failedResult)
  })

  it("should construct a valid promise result", async () => {
    expect(await promiseResult(success("passed"))).toMatchObject(successResult)
    expect(await promiseResult(failure("failed"))).toMatchObject(failedResult)
    expect(await promiseResult(promiseResult(success("passed")))).toMatchObject(
      successResult
    )
    expect(await promiseResult(promiseResult(failure("failed")))).toMatchObject(
      failedResult
    )
  })

  it("should observe promise results without modifying them", async () => {
    const currentFailure = promiseResult(failure("failed"))
    currentFailure.observe((result) => expect(result).toBe("failed"))
    expect(currentFailure).toMatchObject(currentFailure)
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
    ).toMatchObject({ status: "success", value: "passed" })
    expect(
      await currentResult.inverted().withSuccess("newSuccess")
    ).toMatchObject({ status: "success", value: "newSuccess" })
    expect(
      await currentResult.inverted().mapSuccess(() => "mappedSuccess")
    ).toMatchObject({ status: "success", value: "mappedSuccess" })
    expect(
      await currentResult.inverted().flatMapSuccess(() => failure("failed"))
    ).toMatchObject({ status: "failure", value: "failed" })
  })
})
