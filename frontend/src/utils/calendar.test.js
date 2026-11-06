import { describe, expect, it } from "vitest";
import { getMonthGrid } from "./calendar";

describe("getMonthGrid", () => {
  it("starts on the Sunday before the 1st", () => {
    // November 2026 starts on a Sunday
    const days = getMonthGrid(2026, 10);
    expect(days[0]).toEqual({ date: "2026-11-01", day: 1, inMonth: true });
  });

  it("pads with days from the neighbouring months", () => {
    // October 2026 starts on a Thursday
    const days = getMonthGrid(2026, 9);
    expect(days[0].date).toBe("2026-09-27");
    expect(days[0].inMonth).toBe(false);
    expect(days.find((d) => d.date === "2026-10-01").inMonth).toBe(true);
  });

  it("always returns whole weeks", () => {
    for (let month = 0; month < 12; month += 1) {
      const days = getMonthGrid(2026, month);
      expect([35, 42]).toContain(days.length);
    }
  });
});
