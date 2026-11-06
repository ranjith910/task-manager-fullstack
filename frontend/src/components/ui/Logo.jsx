import { Check } from "lucide-react";

function Logo({ light = false, className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          light ? "bg-white text-indigo-600" : "bg-indigo-600 text-white"
        }`}
      >
        <Check size={18} strokeWidth={3} />
      </span>
      <span className={`text-xl font-bold ${light ? "text-white" : "text-gray-900"}`}>Tasknix</span>
    </div>
  );
}

export default Logo;
