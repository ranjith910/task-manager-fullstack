import { toDateString } from "./dates";

// Days to show for a month view, starting on Sunday. Always full weeks,
// so it includes a few days from the previous/next month.
export const getMonthGrid = (year, month) => {
  const firstWeekday = new Date(year, month, 1).getDay();

  const days = Array.from({ length: 42 }, (_, i) => {
    const date = new Date(year, month, 1 - firstWeekday + i);
    return {
      date: toDateString(date),
      day: date.getDate(),
      inMonth: date.getMonth() === month,
    };
  });

  // drop the last week if it's entirely in the next month
  return days[35].inMonth ? days : days.slice(0, 35);
};
