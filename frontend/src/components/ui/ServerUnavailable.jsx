import { CloudOff } from "lucide-react";
import Logo from "./Logo";
import Button from "./Button";

function ServerUnavailable({ message, onRetry }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <Logo />
      <div className="mt-10 w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
        <CloudOff size={22} />
      </div>
      <h1 className="mt-4 text-lg font-semibold text-gray-900">Can't connect right now</h1>
      <p className="mt-2 text-sm text-gray-500 max-w-sm">
        The server might still be starting up. Give it a few seconds and try again.
      </p>
      {message && <p className="mt-2 text-xs text-gray-400">({message})</p>}
      <Button onClick={onRetry} className="mt-6">
        Try again
      </Button>
    </main>
  );
}

export default ServerUnavailable;
