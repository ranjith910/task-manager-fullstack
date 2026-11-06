import { CheckCircle2, Circle, Pencil, Trash2 } from "lucide-react";
import { PriorityBadge, StatusBadge } from "./TaskBadges";
import DueDate from "./DueDate";

function TaskTable({
  tasks,
  isLoading = false,
  isRefreshing = false,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
  emptyState = null,
}) {
  if (isLoading) return <TaskTableSkeleton />;
  if (tasks.length === 0) return emptyState;

  return (
    <div
      aria-busy={isRefreshing}
      className={`transition-opacity ${isRefreshing ? "opacity-60" : ""}`}
    >
      {/* table from md and up */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-y border-gray-100 bg-gray-50">
              <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-500">
                Task
              </th>
              <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-500">
                Due Date
              </th>
              <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-500">
                Priority
              </th>
              <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-500">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-500 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/70 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <CompleteToggle task={task} onToggle={onToggleComplete} />
                    <TaskTitle task={task} />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <DueDate task={task} />
                </td>
                <td className="px-6 py-4">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={task.status} />
                </td>
                <td className="px-6 py-4">
                  <RowActions task={task} onEdit={onEditTask} onDelete={onDeleteTask} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* cards on small screens */}
      <ul className="md:hidden divide-y divide-gray-100 border-t border-gray-100">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-start gap-3 p-4">
            <CompleteToggle task={task} onToggle={onToggleComplete} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <TaskTitle task={task} />
                <RowActions task={task} onEdit={onEditTask} onDelete={onDeleteTask} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
                <DueDate task={task} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TaskTitle({ task }) {
  const completed = task.status === "Completed";

  return (
    <div className="min-w-0">
      <p
        className={`text-sm font-medium break-words ${
          completed ? "text-gray-400 line-through" : "text-gray-800"
        }`}
      >
        {task.title}
      </p>
      {task.description && (
        <p className="text-xs text-gray-400 mt-1 line-clamp-2 max-w-md">{task.description}</p>
      )}
    </div>
  );
}

function CompleteToggle({ task, onToggle }) {
  const completed = task.status === "Completed";

  return (
    <button
      type="button"
      onClick={() => onToggle(task)}
      aria-label={completed ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
      title={completed ? "Mark as not done" : "Mark as done"}
      className={`mt-0.5 shrink-0 rounded-full transition-colors ${
        completed ? "text-green-500 hover:text-green-600" : "text-gray-300 hover:text-indigo-500"
      }`}
    >
      {completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
    </button>
  );
}

function RowActions({ task, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-end gap-1 shrink-0">
      <button
        type="button"
        onClick={() => onEdit(task)}
        aria-label={`Edit "${task.title}"`}
        title="Edit"
        className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
      >
        <Pencil size={16} />
      </button>
      <button
        type="button"
        onClick={() => onDelete(task)}
        aria-label={`Delete "${task.title}"`}
        title="Delete"
        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function TaskTableSkeleton({ rows = 5 }) {
  return (
    <div className="border-t border-gray-100" aria-busy="true" aria-label="Loading tasks">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 animate-pulse"
        >
          <div className="w-5 h-5 rounded-full bg-gray-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-gray-100" />
            <div className="h-2.5 w-1/2 rounded bg-gray-100" />
          </div>
          <div className="hidden md:block h-6 w-16 rounded-full bg-gray-100" />
          <div className="hidden md:block h-6 w-20 rounded-full bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

export default TaskTable;
