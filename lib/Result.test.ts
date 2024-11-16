import { ExtractFailure, ExtractSuccess, failure, PromiseResult, promiseResult, success } from "./Result"

describe("Result tests", () => {
  const successResult = { status: "success", value: "passed" } as const
  const failureResult = { status: "failure", value: "failed" } as const

  it("should construct a valid success result", () => {
    expect(success("passed" as const)).toMatchObject(successResult)
  })

  it("should observe success results without modifying them", () => {
    const currentSuccess = success("passed" as const)

    const assertPromiseValue: ExtractSuccess<typeof currentSuccess> = "passed";

    currentSuccess.observe((result) => expect(result).toBe("passed"))
    expect(currentSuccess).toMatchObject(successResult)
  })

  it("should allow success results to map to promise results", async () => {
    const promiseSuccess = success("passed" as const).flatMapSuccess(() =>
      promiseResult(failure("failed" as const))
    )
    
    const assertPromiseValue: ExtractFailure<typeof promiseSuccess> = "failed";

    expect(await promiseSuccess).toMatchObject(failureResult)
  })

  it("should allow success results to pass through a successful result", async () => {
    const promiseSuccess = promiseResult(
      success("originalSuccess" as const)
    ).passthroughSuccess(() => success("conditional" as const))
    
    const assertPromiseValue: ExtractSuccess<typeof promiseSuccess> = "originalSuccess";

    expect(await promiseSuccess).toMatchObject({
      status: "success",
      value: "originalSuccess"
    })
  })

  it("should not allow success results to pass through a failing result", async () => {
    const promiseSuccess = promiseResult(
      success("originalSuccess" as const)
    ).passthroughSuccess(() => failure("conditional" as const))
    
    const assertPromiseValue: ExtractFailure<typeof promiseSuccess> = "conditional";

    expect(await promiseSuccess).toMatchObject({
      status: "failure",
      value: "conditional"
    })
  })

  it("should allow success results to be transformed", () => {
    const currentSuccess = success("passed" as const);
    const newSuccess = currentSuccess.withSuccess("newSuccess" as const)

    expect(newSuccess).toMatchObject({
      status: "success",
      value: "newSuccess"
    });
    
    const assertTransformedSuccess: ExtractSuccess<typeof newSuccess> = "newSuccess";

    const mappedSuccess = currentSuccess.mapSuccess(() => "mappedSuccess" as const);
    expect(mappedSuccess).toMatchObject({
      status: "success",
      value: "mappedSuccess"
    });

    const assertMappedSuccess: ExtractSuccess<typeof mappedSuccess> = "mappedSuccess";

    const failureResult = currentSuccess.flatMapSuccess(() => failure("failed" as const));
    expect(failureResult).toMatchObject({
      status: "failure",
      value: "failed"
    });

    const assertFailureValue: ExtractFailure<typeof failureResult> = "failed";

    const invertedResult = currentSuccess.inverted();
    expect(invertedResult).toMatchObject({
      status: "failure" as const,
      value: "passed" as const
    });

    const assertInvertedValue: ExtractFailure<typeof invertedResult> = "passed";
  });

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
    const currentFailure = failure("failed" as const);
    
    const newFailure = currentFailure.withFailure("newFailure" as const);
    expect(newFailure).toMatchObject({
      status: "failure" as const,
      value: "newFailure"
    });
    const assertTransformedFailure: ExtractFailure<typeof newFailure> = "newFailure";
  
    const mappedFailure = currentFailure.mapFailure(() => "mappedFailure" as const);
    expect(mappedFailure).toMatchObject({
      status: "failure" as const,
      value: "mappedFailure"
    });
    const assertMappedFailure: ExtractFailure<typeof mappedFailure> = "mappedFailure";
  
    const successResult = currentFailure.flatMapFailure(() => success("passed" as const));
    expect(successResult).toMatchObject({
      status: "success" as const,
      value: "passed"
    });
    const assertSuccessValue: ExtractSuccess<typeof successResult> = "passed";
  
    const invertedResult = currentFailure.inverted();
    expect(invertedResult).toMatchObject({
      status: "success" as const,
      value: "failed" as const
    });
    const assertInvertedValue: ExtractSuccess<typeof invertedResult> = "failed";
  });

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
    const currentResult = promiseResult(failure("failed" as const));
  
    const newFailure = currentResult.withFailure("newFailure" as const);
    const assertNewFailure: PromiseResult<never, "newFailure"> = newFailure; // Assert PromiseResult<never, "newFailure">
    expect(await newFailure).toMatchObject({
      status: "failure" as const,
      value: "newFailure"
    });
  
    const mappedFailure = currentResult.mapFailure(() => "mappedFailure" as const);
    const assertMappedFailure: PromiseResult<never, "mappedFailure"> = mappedFailure; // Assert PromiseResult<never, "mappedFailure">
    expect(await mappedFailure).toMatchObject({
      status: "failure" as const,
      value: "mappedFailure"
    });
  
    const successResult = currentResult.flatMapFailure(() => success("passed" as const));
    const assertSuccessResult: PromiseResult<"passed", never> = successResult; // Assert PromiseResult<"passed", never>
    expect(await successResult).toMatchObject({
      status: "success" as const,
      value: "passed"
    });
  
    const invertedSuccess = currentResult.inverted().withSuccess("newSuccess" as const);
    const assertInvertedSuccess: PromiseResult<"newSuccess", never> = invertedSuccess; // Assert PromiseResult<"newSuccess", never>
    expect(await invertedSuccess).toMatchObject({
      status: "success" as const,
      value: "newSuccess"
    });
  
    const mappedSuccess = currentResult.inverted().mapSuccess(() => "mappedSuccess" as const);
    const assertMappedSuccess: PromiseResult<"mappedSuccess", never> = mappedSuccess; // Assert PromiseResult<"mappedSuccess", never>
    expect(await mappedSuccess).toMatchObject({
      status: "success" as const,
      value: "mappedSuccess"
    });
  
    const invertedFailure = currentResult
      .inverted()
      .flatMapSuccess(() => failure("failed" as const));
    const assertInvertedFailure: PromiseResult<never, "failed"> = invertedFailure; // Assert PromiseResult<never, "failed">
    expect(await invertedFailure).toMatchObject({
      status: "failure" as const,
      value: "failed"
    });
  });
  
})
