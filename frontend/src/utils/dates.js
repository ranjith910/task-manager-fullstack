// The API stores due dates as calendar days at midnight UTC ("2026-11-06T00:00:00.000Z"),
// so we compare the "YYYY-MM-DD" part against the user's local date.

const pad = (value) => String(value).padStart(2, "0");

export const toDateString = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const getTodayString = () => toDateString(new Date());

export const addDays = (dateString, days) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return toDateString(new Date(year, month - 1, day + days));
};

export const dueDateString = (isoDate) => (isoDate ? isoDate.slice(0, 10) : "");

export const isOverdue = (task, today = getTodayString()) =>
  task.status !== "Completed" && dueDateString(task.dueDate) < today;

const shortDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export const formatDate = (isoDate) => (isoDate ? shortDate.format(new Date(isoDate)) : "");

// "Today", "Tomorrow", "Yesterday" or a short date
export const formatDueDate = (isoDate, today = getTodayString()) => {
  const day = dueDateString(isoDate);
  if (day === today) return "Today";
  if (day === addDays(today, 1)) return "Tomorrow";
  if (day === addDays(today, -1)) return "Yesterday";
  return formatDate(isoDate);
};

const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const UNITS = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

export const timeAgo = (isoDate, now = Date.now()) => {
  const seconds = (new Date(isoDate).getTime() - now) / 1000;

  for (const [unit, unitSeconds] of UNITS) {
    if (Math.abs(seconds) >= unitSeconds) {
      return relativeTime.format(Math.round(seconds / unitSeconds), unit);
    }
  }
  return "just now";
};
