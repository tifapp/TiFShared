import { ZodError } from "zod"
import { dateRange } from "../../domain-models/FixedDateRange"
import { CreateFixedDateRangeSchema, FixedDateRangeSchema, MIN_EVENT_DURATION } from "./FixedDateRange"

describe("FixedDateRangeSchema tests", () => {
  test("valid FixedDateRange", () => {
    expect(FixedDateRangeSchema.parse({
      startDateTime: "2023-02-25T00:19:00.00Z",
      endDateTime: "2023-02-25T00:20:00.00Z"
    })).toEqual(dateRange(
      new Date("2023-02-25T00:19:00.00Z"),
      new Date("2023-02-25T00:20:00.00Z")
    ))
  })

  test("invalid dates", () => {
    expect(() => FixedDateRangeSchema.parse({
      startDateTime: "iuahbxgwd7823823geg",
      endDateTime: "2023-02-25T00:18:00.00Z"
    })).toThrow("Invalid date")
    
    expect(() => FixedDateRangeSchema.parse({
      startDateTime: "2023-02-25T00:18:00.00Z",
      endDateTime: "899832ue982hdh"
    })).toThrow("Invalid date")
  })
  
  test("start date before end date", () => {
    expect(() => FixedDateRangeSchema.parse({
      startDateTime: "2023-02-25T00:19:00.00Z",
      endDateTime: "2023-02-25T00:18:00.00Z"
    })).toThrow(`Start Date must be before End Date.`)
  })
})

describe("CreateFixedDateRangeSchema tests", () => {
  const staticNow = new Date("2024-01-01T00:00:00.000Z");

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(staticNow);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test("valid FixedDateRange instance with sufficient duration and future end date", () => {
    const testRange = dateRange(
      staticNow,
      new Date(staticNow.getTime() + (MIN_EVENT_DURATION) * 1000)
    );

    expect(CreateFixedDateRangeSchema.parse(testRange)).toEqual(testRange);
  });

  test("invalid duration and end date in the past", () => {
    const start = new Date(staticNow.getTime() - 100000)

    const testRange = dateRange(
      start,
      new Date(start.getTime() + (MIN_EVENT_DURATION / 2) * 1000)
    );

    try {
      CreateFixedDateRangeSchema.parse(testRange);
    } catch (e) {
      if (e instanceof ZodError) {
        expect(e.errors).toMatchObject([
          {
            code: "custom",
            message: "The duration must be at least 60 seconds.",
            fatal: true,
          },
          {
            code: "custom",
            message: "The end date cannot be in the past.",
            fatal: true,
          },
        ]);
      }
    }
  });
});