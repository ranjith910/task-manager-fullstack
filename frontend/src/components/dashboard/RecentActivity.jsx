import { Activity } from "lucide-react";
import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";
import { timeAgo } from "../../utils/dates";

const ACTIONS = {
  created: { color: "bg-indigo-500", verb: "Created" },
  completed: { color: "bg-green-500", verb: "Completed" },
  status_changed: { color: "bg-blue-500", verb: "Moved" },
  updated: { color: "bg-orange-400", verb: "Updated" },
  deleted: { color: "bg-red-500", verb: "Deleted" },
};

function ActivityText({ item }) {
  const { verb } = ACTIONS[item.action] || ACTIONS.updated;

  return (
    <>
      {verb} <span className="font-semibold text-gray-800">{item.taskTitle}</span>
      {item.action === "status_changed" && item.meta?.to && <> to {item.meta.to}</>}
    </>
  );
}

function RecentActivity({ items, status, error, onRetry, className = "" }) {
  const isLoading = status !== "succeeded" && status !== "failed" && items.length === 0;

  return (
    <section className={`bg-white p-6 rounded-xl border border-gray-100 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
      <p className="text-sm text-gray-400 mt-1">What changed in your workspace lately</p>

      {isLoading && (
        <ul className="mt-6 space-y-6" aria-busy="true" aria-label="Loading activity">
          {[1, 2, 3, 4].map((i) => (
            <li key={i} className="flex gap-3 animate-pulse">
              <span className="w-2.5 h-2.5 mt-1.5 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 rounded bg-gray-100" />
                <div className="h-2.5 w-20 rounded bg-gray-100" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {status === "failed" && items.length === 0 && (
        <ErrorState message={error} onRetry={onRetry} />
      )}

      {status === "succeeded" && items.length === 0 && (
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Things you do with your tasks will show up here."
        />
      )}

      {items.length > 0 && (
        <ul className="mt-6 space-y-5">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <span
                className={`w-2.5 h-2.5 mt-1.5 shrink-0 rounded-full ${
                  (ACTIONS[item.action] || ACTIONS.updated).color
                }`}
              />
              <div className="min-w-0">
                <p className="text-sm text-gray-600 break-words">
                  <ActivityText item={item} />
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  <time dateTime={item.createdAt}>{timeAgo(item.createdAt)}</time>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default RecentActivity;
