import { Search, Bell, ChevronDown } from "lucide-react";

function Header() {
  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      {/* Page title */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Overview</h2>
        <p className="text-sm text-gray-400">
          Welcome back! Here's your productivity overview.
        </p>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 w-64">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Notifications */}
        <button className="relative text-gray-500 hover:text-indigo-600">
          <Bell size={21} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Profile */}
        <button className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
            R
          </div>

          <div className="text-left">
            <p className="text-sm font-semibold text-gray-700">Ranjith</p>
            <p className="text-xs text-gray-400">User</p>
          </div>

          <ChevronDown size={16} className="text-gray-400" />
        </button>
      </div>
    </header>
  );
}

export default Header;
