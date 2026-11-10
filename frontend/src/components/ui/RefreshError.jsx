import { AlertTriangle } from "lucide-react";

// shown when a request fails but the rest of the page can still be used
function RefreshError({
  onRetry,
  message = "Couldn't refresh, this might be out of date.",
  className = "mx-4 sm:mx-6 mb-4",
}) {
  return (
    <div
      role="alert"
      className={`${className} flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-800`}
    >
      <AlertTriangle size={16} className="shrink-0" />
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="font-medium underline underline-offset-2 hover:text-amber-900"
      >
        Retry
      </button>
    </div>
  );
}

export default RefreshError;
