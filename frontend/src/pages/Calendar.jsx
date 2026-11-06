import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CalendarDays, ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import RefreshError from "../components/ui/RefreshError";
import { PriorityBadge, StatusBadge } from "../components/tasks/TaskBadges";
import useTaskActions from "../hooks/useTaskActions";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { fetchCalendarTasks } from "../redux/slices/taskSlice";
import { getMonthGrid } from "../utils/calendar";
import { dueDateString, getTodayString, isOverdue } from "../utils/dates";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const monthFormat = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
const dayFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

const parseDate = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const chipStyle = (task, today) => {
  if (task.status === "Completed") return "bg-green-50 text-green-700 line-through";
  if (isOverdue(task, today)) return "bg-red-50 text-red-700";
  if (task.status === "In Progress") return "bg-blue-50 text-blue-700";
  return "bg-indigo-50 text-indigo-700";
};

const dotStyle = (task, today) => {
  if (task.status === "Completed") return "bg-green-500";
  if (isOverdue(task, today)) return "bg-red-500";
  return "bg-indigo-500";
};

function Calendar() {
  useDocumentTitle("Calendar");
  const dispatch = useDispatch();
  const { items, status, error, total } = useSelector((state) => state.tasks.calendar);
  const version = useSelector((state) => state.tasks.version);
  const { openCreate, openEdit, requestDelete, toggleComplete, modals } = useTaskActions();

  const today = getTodayString();
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const date = parseDate(today);
    return { year: date.getFullYear(), month: date.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState(today);
  const [retryCount, setRetryCount] = useState(0);

  const days = useMemo(() => getMonthGrid(visibleMonth.year, visibleMonth.month), [visibleMonth]);
  const from = days[0].date;
  const to = days[days.length - 1].date;

  useEffect(() => {
    const request = dispatch(fetchCalendarTasks({ from, to }));
    return () => request.abort();
  }, [dispatch, from, to, version, retryCount]);

  const tasksByDate = useMemo(() => {
    const groups = {};
    for (const task of items) {
      const key = dueDateString(task.dueDate);
      (groups[key] ||= []).push(task);
    }
    return groups;
  }, [items]);

  const changeMonth = (offset) => {
    setVisibleMonth(({ year, month }) => {
      const date = new Date(year, month + offset, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  };

  const goToToday = () => {
    const date = parseDate(today);
    setVisibleMonth({ year: date.getFullYear(), month: date.getMonth() });
    setSelectedDate(today);
  };

  const selectedTasks = tasksByDate[selectedDate] || [];
  const isLoading = status !== "succeeded" && status !== "failed" && items.length === 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <section className="xl:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-800" aria-live="polite">
            {monthFormat.format(new Date(visibleMonth.year, visibleMonth.month, 1))}
          </h2>
          <div className="flex items-center gap-1">
            <Button variant="secondary" onClick={goToToday} className="mr-1 py-2">
              Today
            </Button>
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              aria-label="Previous month"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              aria-label="Next month"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {total > items.length && (
          <p className="px-6 pb-3 text-xs text-amber-600">
            Showing the first {items.length} of {total} tasks in this range.
          </p>
        )}

        {status === "failed" && items.length > 0 && (
          <RefreshError onRetry={() => setRetryCount((count) => count + 1)} />
        )}

        <div className="grid grid-cols-7 border-y border-gray-100 bg-gray-50">
          {WEEKDAYS.map((weekday) => (
            <div key={weekday} className="py-2 text-center text-xs font-semibold text-gray-500">
              {weekday}
            </div>
          ))}
        </div>

        <div className={`grid grid-cols-7 ${status === "loading" ? "opacity-70" : ""}`}>
          {days.map((day) => {
            const dayTasks = tasksByDate[day.date] || [];
            const isSelected = day.date === selectedDate;
            const isToday = day.date === today;

            return (
              <div
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className={`min-h-16 sm:min-h-24 lg:min-h-28 border-b border-r border-gray-100 p-1 sm:p-2 cursor-pointer transition-colors ${
                  day.inMonth ? "bg-white hover:bg-gray-50" : "bg-gray-50/70 hover:bg-gray-100/70"
                } ${isSelected ? "ring-2 ring-inset ring-indigo-500" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedDate(day.date)}
                  aria-pressed={isSelected}
                  aria-label={`${dayFormat.format(parseDate(day.date))}, ${dayTasks.length} ${
                    dayTasks.length === 1 ? "task" : "tasks"
                  }`}
                  className={`w-7 h-7 rounded-full text-sm flex items-center justify-center ${
                    isToday
                      ? "bg-indigo-600 text-white font-semibold"
                      : day.inMonth
                        ? "text-gray-700 hover:bg-gray-100"
                        : "text-gray-400"
                  }`}
                >
                  {day.day}
                </button>

                <div className="hidden sm:block mt-1 space-y-1">
                  {dayTasks.slice(0, 2).map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(task);
                      }}
                      title={task.title}
                      className={`block w-full truncate rounded px-1.5 py-0.5 text-left text-xs font-medium ${chipStyle(task, today)}`}
                    >
                      {task.title}
                    </button>
                  ))}
                  {dayTasks.length > 2 && (
                    <p className="px-1.5 text-xs text-gray-500">+{dayTasks.length - 2} more</p>
                  )}
                </div>

                {dayTasks.length > 0 && (
                  <div className="sm:hidden mt-1 flex justify-center gap-0.5" aria-hidden="true">
                    {dayTasks.slice(0, 3).map((task) => (
                      <span
                        key={task.id}
                        className={`w-1.5 h-1.5 rounded-full ${dotStyle(task, today)}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <aside className="bg-white rounded-xl border border-gray-100 self-start">
        <div className="flex items-start justify-between gap-3 p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {selectedDate === today ? "Today" : dayFormat.format(parseDate(selectedDate))}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {selectedTasks.length === 0
                ? "Nothing due"
                : `${selectedTasks.length} ${selectedTasks.length === 1 ? "task" : "tasks"} due`}
            </p>
          </div>
          <Button variant="secondary" onClick={() => openCreate(selectedDate)} className="py-2">
            <Plus size={16} />
            Add
          </Button>
        </div>

        {isLoading && (
          <div className="p-6 space-y-4" aria-busy="true" aria-label="Loading tasks">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {status === "failed" && items.length === 0 && (
          <ErrorState message={error} onRetry={() => setRetryCount((count) => count + 1)} />
        )}

        {!isLoading && status !== "failed" && selectedTasks.length === 0 && (
          <EmptyState
            icon={CalendarDays}
            title="No tasks on this day"
            description="Pick another day or add a task for this one."
          />
        )}

        {selectedTasks.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {selectedTasks.map((task) => (
              <li key={task.id} className="p-4 sm:px-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium break-words ${
                        task.status === "Completed" ? "text-gray-400 line-through" : "text-gray-800"
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                      {isOverdue(task, today) && (
                        <span className="text-xs font-medium text-red-600 self-center">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(task)}
                      aria-label={`Edit "${task.title}"`}
                      className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => requestDelete(task)}
                      aria-label={`Delete "${task.title}"`}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleComplete(task)}
                  className="mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                >
                  {task.status === "Completed" ? "Mark as not done" : "Mark as done"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {modals}
    </div>
  );
}

export default Calendar;
