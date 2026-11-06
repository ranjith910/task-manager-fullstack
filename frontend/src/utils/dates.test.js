import { describe, expect, it } from "vitest";
import { addDays, dueDateString, formatDueDate, isOverdue, timeAgo } from "./dates";

const task = (dueDate, status = "Pending") => ({ dueDate: `${dueDate}T00:00:00.000Z`, status });

describe("dates", () => {
  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("reads the calendar day from the API date", () => {
    expect(dueDateString("2026-11-06T00:00:00.000Z")).toBe("2026-11-06");
    expect(dueDateString(null)).toBe("");
  });

  it("marks unfinished tasks before today as overdue", () => {
    const today = "2026-11-06";
    expect(isOverdue(task("2026-11-05"), today)).toBe(true);
    expect(isOverdue(task("2026-11-06"), today)).toBe(false);
    expect(isOverdue(task("2026-11-01", "Completed"), today)).toBe(false);
  });

  it("uses friendly labels near today", () => {
    const today = "2026-11-06";
    expect(formatDueDate("2026-11-06T00:00:00.000Z", today)).toBe("Today");
    expect(formatDueDate("2026-11-07T00:00:00.000Z", today)).toBe("Tomorrow");
    expect(formatDueDate("2026-11-05T00:00:00.000Z", today)).toBe("Yesterday");
    expect(formatDueDate("2026-12-25T00:00:00.000Z", today)).toBe("Dec 25, 2026");
  });

  it("formats relative times", () => {
    const now = new Date("2026-11-06T12:00:00.000Z").getTime();
    expect(timeAgo("2026-11-06T11:59:40.000Z", now)).toBe("just now");
    expect(timeAgo("2026-11-06T10:00:00.000Z", now)).toBe("2 hours ago");
    expect(timeAgo("2026-11-05T12:00:00.000Z", now)).toBe("yesterday");
    expect(timeAgo("2026-10-20T12:00:00.000Z", now)).toBe("2 weeks ago");
  });
});
