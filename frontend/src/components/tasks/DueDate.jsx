import { dueDateString, formatDueDate, getTodayString, isOverdue } from "../../utils/dates";

function DueDate({ task }) {
  const today = getTodayString();
  const label = formatDueDate(task.dueDate, today);

  if (isOverdue(task, today)) {
    return (
      <span className="text-sm font-medium text-red-600">
        {label}
        <span className="block text-xs font-normal text-red-500">Overdue</span>
      </span>
    );
  }

  const dueToday = task.status !== "Completed" && dueDateString(task.dueDate) === today;
  return (
    <span className={`text-sm ${dueToday ? "font-medium text-amber-600" : "text-gray-500"}`}>
      {label}
    </span>
  );
}

export default DueDate;
