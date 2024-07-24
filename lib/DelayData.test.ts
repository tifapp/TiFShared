import { fakeTimers } from "../test-helpers/FakeTimers";
import { delayData, sleep } from "./DelayData";

const isPromiseResolved = (promise: Promise<any>) => Promise.race([promise.then(() => true), Promise.resolve(false)])

describe("DelayData tests", () => {
  fakeTimers();

  test('delayData returns the correct value after the specified delay', async () => {
    const result = 'testValue';
    const resultPromise = delayData(result, 1000);
    jest.advanceTimersByTime(600);
    await expect(isPromiseResolved(resultPromise)).resolves.toBe(false);
    jest.advanceTimersByTime(400);
    await expect(resultPromise).resolves.toBe(result);
  });

  test('delayData can be cancelled using an AbortSignal', async () => {
    const abortController = new AbortController();
    const resultPromise = delayData('testValue', 1000, abortController.signal);
    abortController.abort();
    await expect(resultPromise).rejects.toThrow('Delay cancelled');
  });

  test('cleanup happens correctly for unresolved delayData', async () => {
    const resultPromise = delayData('testValue', 5000);
    jest.advanceTimersByTime(2000);
    expect(jest.getTimerCount()).toBe(1);
    jest.advanceTimersByTime(3000);
    await resultPromise.catch(() => {});
    expect(jest.getTimerCount()).toBe(0);
  });

  test('sleep for the specified time', async () => {
    const sleepPromise = sleep(1000);
    jest.advanceTimersByTime(600);
    await expect(isPromiseResolved(sleepPromise)).resolves.toBe(false);
    jest.advanceTimersByTime(400);
    await expect(sleepPromise).resolves.toBeUndefined();
  });

  test('sleep can be cancelled using an AbortSignal', async () => {
    const abortController = new AbortController();
    const sleepPromise = sleep(2000, abortController.signal);
    abortController.abort();
    await expect(sleepPromise).rejects.toThrow('Delay cancelled');
  });
});
