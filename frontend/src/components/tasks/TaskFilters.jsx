import { AlertCircle, Search, X } from "lucide-react";
import { inputClass } from "../ui/inputClass";
import { SORT_OPTIONS, TASK_PRIORITIES, TASK_STATUSES } from "../../utils/constants";

function TaskFilters({ filters, searchValue, onSearchChange, onChange, onReset }) {
  const hasActiveFilters = Boolean(
    searchValue || filters.status || filters.priority || filters.overdue,
  );

  return (
    <div className="flex flex-col xl:flex-row gap-3 xl:items-center p-4 sm:px-6">
      <div className="relative flex-1 min-w-0">
        <Search
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title or description"
          aria-label="Search tasks"
          className={`${inputClass(false)} pl-9`}
        />
      </div>

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
        <select
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value })}
          aria-label="Filter by status"
          className={`${inputClass(false)} sm:w-auto`}
        >
          <option value="">All statuses</option>
          {TASK_STATUSES.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => onChange({ priority: e.target.value })}
          aria-label="Filter by priority"
          className={`${inputClass(false)} sm:w-auto`}
        >
          <option value="">All priorities</option>
          {TASK_PRIORITIES.map((priority) => (
            <option key={priority}>{priority}</option>
          ))}
        </select>

        <select
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value })}
          aria-label="Sort tasks"
          className={`${inputClass(false)} sm:w-auto`}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onChange({ overdue: !filters.overdue })}
          aria-pressed={filters.overdue}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-colors ${
            filters.overdue
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          <AlertCircle size={16} />
          Overdue
        </button>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 self-start xl:self-auto text-sm font-medium text-gray-500 hover:text-gray-800"
        >
          <X size={16} />
          Clear filters
        </button>
      )}
    </div>
  );
}

export default TaskFilters;
