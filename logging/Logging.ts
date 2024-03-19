export const LOG_LEVELS = ["debug", "info", "warn", "error", "trace"] as const

/**
 * A level to be used when logging.
 *
 * `debug` = important stuff that doesn't matter in prod
 *
 * `info` = general log message
 *
 * `trace` = useful for tracing a list of steps up until a major issue occurs
 *
 * `warn` = a forewarning that a giant alien spider will trample this lostbe- I mean world
 *
 * `error` = for when an error occurs
 */
export type LogLevel = (typeof LOG_LEVELS)[number]

/**
 * A type that handles log messages and sends them somewhere (file, SQLite, Sentry, etc).
 */
export type LogHandler = (
  label: string,
  level: LogLevel,
  message: string,
  metadata?: object
) => void

/**
 * A {@link LogHandler} which uses the built-in `console`.
 *
 * @param formatter A function to format the log message
 */
export const consoleLogHandler = (
  formatter: (
    label: string,
    level: LogLevel,
    message: string,
    metadata?: object
  ) => string = defaultFormatLogMessage
): LogHandler => {
  return (label, level, message, metadata) => {
    console[level](formatter(label, level, message, metadata))
  }
}

let logHandlers = [] as LogHandler[]

/**
 * An object for logging.
 */
export type Logger = Record<
  LogLevel,
  (message: string, metadata?: object) => void
>

/**
 * Creates a function to log with a given label.
 *
 * Use this instead of `console.log` to log to many different sources at once.
 *
 * ```ts
 * const log = logger("example")
 * addLogHandler(consoleLogHandler())
 * addLogHandler(rotatingLogFileHandler(...))
 *
 * // Logs to both the console and filesystem.
 * log.info("Message", { key: "value" })
 * ```
 *
 * You can add custom destinations by {@link LogHandler}s to {@link addLogHandler}.
 *
 * Additionally, each call to `log` can be passed a generic object of metadata.
 * How this object is logged depends on the {@link LogHandler} handling the
 * metadata. This metadata object ensures that no messy string interpolation is
 * needed for log messages.
 *
 * @param label The label which identifies this logger, use this in different modules of the app to identify specific components.
 * @returns A function which handles logging.
 */
export const logger = (label: string) => {
  return LOG_LEVELS.reduce((acc, level) => {
    acc[level] = (message: string, metadata?: object) => {
      logHandlers.forEach((h) => h(label, level, message, metadata))
    }
    return acc
  }, {} as Logger)
}

/**
 * Adds a log handler that can handle and receive log messages via calls from
 * the function created by `logger`.
 *
 * Use this function and {2link LogHandler} to add multiple log destinations
 * (filesystem, Sentry, etc).
 */
export const addLogHandler = (handler: LogHandler) => {
  logHandlers.push(handler)
}

/**
 * Removes all active log handlers.
 */
export const resetLogHandlers = () => {
  logHandlers = []
}

/**
 * The default formatter for a log message.
 */
export const defaultFormatLogMessage = (
  label: string,
  level: LogLevel,
  message: string,
  metadata?: object
) => {
  const currentDate = new Date()
  const levelEmoji = LEVEL_EMOJIS[level]
  const stringifiedMetadata = JSON.stringify(metadata)
  const metadataStr = stringifiedMetadata ? ` ${stringifiedMetadata}` : ""
  return `${currentDate.toISOString()} [${label}] (${level.toUpperCase()} ${levelEmoji}) ${message}${metadataStr}\n`
}

const LEVEL_EMOJIS = {
  debug: "🟢",
  info: "🔵",
  trace: "⚪️",
  warn: "🟡",
  error: "🔴"
} satisfies Record<LogLevel, string>
