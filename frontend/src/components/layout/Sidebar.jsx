import { NavLink } from "react-router";
import { useSelector } from "react-redux";
import { CalendarDays, CheckSquare, LayoutDashboard, LogOut, Settings, X } from "lucide-react";
import Logo from "../ui/Logo";
import Avatar from "../ui/Avatar";
import useLogout from "../../hooks/useLogout";

const WORKSPACE_LINKS = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/tasks", label: "My Tasks", icon: CheckSquare },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
];

function Sidebar({ isOpen, onClose }) {
  const user = useSelector((state) => state.auth.user);
  const handleLogout = useLogout();

  return (
    <>
      {/* backdrop for the mobile drawer */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-gray-900/40 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-[transform,visibility] duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:visible ${
          isOpen ? "translate-x-0 visible" : "-translate-x-full invisible"
        }`}
      >
        <div className="h-16 lg:h-20 flex items-center justify-between px-6 border-b border-gray-100">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <nav aria-label="Main" className="flex-1 overflow-y-auto p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase px-3 mb-3">Workspace</p>
          <div className="space-y-1">
            {WORKSPACE_LINKS.map((link) => (
              <NavItem key={link.to} {...link} onClick={onClose} />
            ))}
          </div>

          <p className="text-xs font-semibold text-gray-400 uppercase px-3 mt-8 mb-3">General</p>
          <NavItem to="/settings" label="Settings" icon={Settings} onClick={onClose} />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar name={user.name} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-700 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function NavItem({ to, label, icon: Icon, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-indigo-50 text-indigo-600"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        }`
      }
    >
      <Icon size={20} />
      {label}
    </NavLink>
  );
}

export default Sidebar;
