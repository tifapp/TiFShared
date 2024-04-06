/**
 * Pollyfills {@link Promise.allSettled}.
 *
 * This pollyfill cannot be applied in the global scope due to Sentry.
 */
export const pollyfillPromise = () => {
  Promise.allSettled = Promise.allSettled || allSettled
}

const allSettled = (promises: any[]) => {
  return Promise.all(
    promises.map(async (p: Promise<any>) => {
      try {
        return {
          status: "fulfilled" as const,
          value: await p
        }
      } catch (reason) {
        return {
          status: "rejected" as const,
          reason
        }
      }
    })
  )
}
