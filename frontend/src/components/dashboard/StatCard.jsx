import { ArrowUpRight } from "lucide-react";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconBg,
  iconColor,
  isLoading,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left bg-white p-4 sm:p-5 lg:p-6 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition focus-visible:outline-2 focus-visible:outline-indigo-500"
    >
      <div className="flex items-center justify-between">
        <div
          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center ${iconBg}`}
        >
          <Icon size={20} className={iconColor} />
        </div>
        <ArrowUpRight
          size={18}
          aria-hidden="true"
          className="text-gray-300 group-hover:text-indigo-500 transition-colors"
        />
      </div>

      <p className="text-sm text-gray-500 mt-3 sm:mt-5">{title}</p>
      {isLoading ? (
        <div className="h-9 w-14 mt-1 rounded bg-gray-100 animate-pulse" />
      ) : (
        <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{value ?? "-"}</p>
      )}
      <p className="text-xs text-gray-400 mt-1 sm:mt-2">{description}</p>
    </button>
  );
}

export default StatCard;
