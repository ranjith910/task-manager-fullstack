const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ProgressCard({ stats, isLoading }) {
  const total = stats?.total ?? 0;
  const rate = stats?.completionRate ?? 0;
  // stats can be missing if the request failed, show dashes rather than fake zeros
  const rows = [
    { label: "Completed", value: stats?.byStatus.Completed, color: "bg-green-500" },
    { label: "In Progress", value: stats?.byStatus["In Progress"], color: "bg-blue-500" },
    { label: "Pending", value: stats?.byStatus.Pending, color: "bg-gray-300" },
  ];

  return (
    <section className="bg-white p-6 rounded-xl border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800">Task Progress</h2>
      <p className="text-sm text-gray-400 mt-1">Your overall task completion</p>

      <div className="mt-6 flex justify-center">
        <div className="relative w-40 h-40">
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full -rotate-90"
            role="img"
            aria-label={`${rate}% of tasks completed`}
          >
            <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#e0e7ff" strokeWidth="12" />
            {rate > 0 && (
              <circle
                cx="60"
                cy="60"
                r={RADIUS}
                fill="none"
                stroke="#4f46e5"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE * (1 - rate / 100)}
                className="transition-[stroke-dashoffset] duration-700"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isLoading ? (
              <div className="h-8 w-14 rounded bg-gray-100 animate-pulse" />
            ) : (
              <span className="text-3xl font-bold text-gray-800">{stats ? `${rate}%` : "-"}</span>
            )}
            <span className="text-xs text-gray-400 mt-1">Completed</span>
          </div>
        </div>
      </div>

      <ul className="mt-6 space-y-4">
        {rows.map((row) => (
          <li key={row.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-600">
                <span className={`w-2.5 h-2.5 rounded-full ${row.color}`} />
                {row.label}
              </span>
              <span className="font-semibold text-gray-700">{row.value ?? "-"}</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${row.color} transition-[width] duration-700`}
                style={{ width: total ? `${(row.value / total) * 100}%` : "0%" }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ProgressCard;
