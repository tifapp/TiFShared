/**
 * Fakes jest timers for the duration of each test.
 */
export const fakeTimers = (
  wrapRunPendingTimers: (
    runPendingTimers: () => Promise<void>
  ) => Promise<void> = async () => {} // NB: This needs to be act on the frontend.
) => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(async () => {
    await wrapRunPendingTimers(
      async () => await jest.runOnlyPendingTimersAsync()
    )
    jest.useRealTimers()
  })
}
