const PRIORITY_STYLES = {
  High: "bg-red-50 text-red-700",
  Medium: "bg-orange-50 text-orange-700",
  Low: "bg-green-50 text-green-700",
};

const STATUS_STYLES = {
  Completed: "bg-green-50 text-green-700",
  "In Progress": "bg-blue-50 text-blue-700",
  Pending: "bg-gray-100 text-gray-700",
};

const badge =
  "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap";

export function PriorityBadge({ priority }) {
  return <span className={`${badge} ${PRIORITY_STYLES[priority]}`}>{priority}</span>;
}

export function StatusBadge({ status }) {
  return <span className={`${badge} ${STATUS_STYLES[status]}`}>{status}</span>;
}
