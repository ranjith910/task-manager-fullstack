import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Logo from "./Logo";

function FullPageLoader() {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSlow(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <Loader2 size={24} className="animate-spin text-indigo-600" aria-label="Loading" />
      {isSlow && (
        <p className="text-sm text-gray-500 max-w-xs" role="status">
          Waking up the server. On the free hosting plan this can take up to a minute.
        </p>
      )}
    </div>
  );
}

export default FullPageLoader;
