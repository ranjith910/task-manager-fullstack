import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-indigo-600">Tasknix</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase px-3 mb-4">
          Workspace
        </p>

        <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active />

        <NavItem icon={<CheckSquare size={20} />} label="My Tasks" />

        <NavItem icon={<CalendarDays size={20} />} label="Calendar" />

        <NavItem icon={<Users size={20} />} label="Team" />

        <div className="pt-8">
          <p className="text-xs font-semibold text-gray-400 uppercase px-3 mb-4">
            General
          </p>

          <NavItem icon={<Settings size={20} />} label="Settings" />
        </div>
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center gap-3 px-3 py-3 w-full text-gray-500 hover:text-red-500 rounded-lg">
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active = false }) {
  return (
    <button
      className={`flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-indigo-50 text-indigo-600"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export default Sidebar;
