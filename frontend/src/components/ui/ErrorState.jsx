import { AlertTriangle } from "lucide-react";
import Button from "./Button";

function ErrorState({ message = "Something went wrong", onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center text-center px-6 py-12">
      <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
        <AlertTriangle size={22} />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-gray-800">Couldn't load this</h3>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-5">
          Try again
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
