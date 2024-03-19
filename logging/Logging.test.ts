import { repeatElements } from "../lib/Array"
import { fakeTimers } from "../test-helpers/FakeTimers"
import {
  LOG_LEVELS,
  addLogHandler,
  logger,
  defaultFormatLogMessage,
  resetLogHandlers
} from "./Logging"

describe("Logging tests", () => {
  describe("DefaultLogFormatter tests", () => {
    fakeTimers()

    beforeEach(() => jest.setSystemTime(new Date("2024-03-19T04:41:44.385Z")))

    test("formatting for each log level with metadata", () => {
      expect(
        defaultFormatLogMessage("test.label", "debug", "Hello world", {
          key: "value"
        })
      ).toEqual(
        '2024-03-19T04:41:44.385Z [test.label] (DEBUG 🟢) Hello world {"key":"value"}\n'
      )
      expect(
        defaultFormatLogMessage("test.label", "info", "Hello world", {
          key: "value"
        })
      ).toEqual(
        '2024-03-19T04:41:44.385Z [test.label] (INFO 🔵) Hello world {"key":"value"}\n'
      )
      expect(
        defaultFormatLogMessage("test.label", "trace", "Hello world", {
          key: "value"
        })
      ).toEqual(
        '2024-03-19T04:41:44.385Z [test.label] (TRACE ⚪️) Hello world {"key":"value"}\n'
      )
      expect(
        defaultFormatLogMessage("test.label", "warn", "Hello world", {
          key: "value"
        })
      ).toEqual(
        '2024-03-19T04:41:44.385Z [test.label] (WARN 🟡) Hello world {"key":"value"}\n'
      )
      expect(
        defaultFormatLogMessage("test.label", "error", "Hello world", {
          key: "value"
        })
      ).toEqual(
        '2024-03-19T04:41:44.385Z [test.label] (ERROR 🔴) Hello world {"key":"value"}\n'
      )
    })

    test("formatting without metadata", () => {
      expect(
        defaultFormatLogMessage("test.label", "error", "Hello world")
      ).toEqual(
        "2024-03-19T04:41:44.385Z [test.label] (ERROR 🔴) Hello world\n"
      )
    })
  })

  describe("CreateLogFunction tests", () => {
    const log = logger("test.log.function")

    const testLogHandlers = repeatElements(5, () => jest.fn())

    it("should log to all log handlers", () => {
      testLogHandlers.forEach(addLogHandler)
      LOG_LEVELS.forEach((level) => {
        log[level]("Test", { key: "value" })
        testLogHandlers.forEach((handler) => {
          expect(handler).toHaveBeenCalledWith(
            "test.log.function",
            level,
            "Test",
            {
              key: "value"
            }
          )
          expect(handler).toHaveBeenCalledTimes(1)
          handler.mockReset()
        })
      })
    })

    it("should not log to any handler after resetting", () => {
      testLogHandlers.forEach(addLogHandler)
      resetLogHandlers()
      LOG_LEVELS.forEach((level) => {
        log[level]("Test", { key: "value" })
        testLogHandlers.forEach((handler) => {
          expect(handler).not.toHaveBeenCalled()
          handler.mockReset()
        })
      })
    })
  })
})
