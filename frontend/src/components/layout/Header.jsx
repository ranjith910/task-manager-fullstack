import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertCircle,
  Bell,
  CalendarClock,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
} from "lucide-react";
import Avatar from "../ui/Avatar";
import useDropdown from "../../hooks/useDropdown";
import useLogout from "../../hooks/useLogout";
import { fetchTaskStats, showTasks } from "../../redux/slices/taskSlice";

const PAGES = {
  "/": { title: "Overview" },
  "/tasks": { title: "My Tasks", subtitle: "Search, filter and manage all of your tasks." },
  "/calendar": { title: "Calendar", subtitle: "See what's due and plan ahead." },
  "/settings": { title: "Settings", subtitle: "Manage your profile and password." },
};

function Header({ onMenuClick, isMenuOpen, menuButtonRef }) {
  const { pathname } = useLocation();
  const user = useSelector((state) => state.auth.user);

  const page = PAGES[pathname] || { title: "Tasknix" };
  const subtitle =
    page.subtitle ?? `Welcome back, ${user.name.split(" ")[0]}! Here's your productivity overview.`;

  return (
    <header className="sticky top-0 z-20 h-16 lg:h-20 bg-white/95 backdrop-blur border-b border-gray-200 flex items-center gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8">
      <button
        ref={menuButtonRef}
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        aria-expanded={isMenuOpen}
        aria-controls="main-menu"
        className="lg:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100"
      >
        <Menu size={22} />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="text-lg lg:text-xl font-semibold text-gray-800 truncate">{page.title}</h1>
        <p className="hidden sm:block text-sm text-gray-400 truncate">{subtitle}</p>
      </div>

      {pathname !== "/tasks" && <HeaderSearch />}
      <Notifications />
      <ProfileMenu user={user} />
    </header>
  );
}

function HeaderSearch() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(showTasks({ search: query.trim() }));
    navigate("/tasks");
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-56 lg:w-64 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100"
    >
      <Search size={17} className="text-gray-400 shrink-0" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search tasks..."
        aria-label="Search tasks"
        className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder:text-gray-400"
      />
    </form>
  );
}

function Notifications() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: stats, status } = useSelector((state) => state.tasks.stats);
  const { isOpen, close, containerRef, buttonProps, panelId } = useDropdown();

  const overdue = stats?.overdue ?? 0;
  const dueToday = stats?.dueToday ?? 0;
  const count = overdue + dueToday;

  const showOverdue = () => {
    close();
    dispatch(showTasks({ overdue: true }));
    navigate("/tasks");
  };

  const showCalendar = () => {
    close();
    navigate("/calendar");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        {...buttonProps}
        aria-label={count ? `Notifications (${count})` : "Notifications"}
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-indigo-600"
      >
        <Bell size={21} />
        {count > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <div
          id={panelId}
          className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-gray-100 bg-white shadow-lg p-2"
        >
          <p className="px-3 py-2 text-xs font-semibold uppercase text-gray-400">Notifications</p>
          {!stats && status === "failed" ? (
            <div className="px-3 pb-3 text-sm text-gray-500">
              Couldn't load notifications.{" "}
              <button
                type="button"
                onClick={() => dispatch(fetchTaskStats())}
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                Retry
              </button>
            </div>
          ) : !stats ? (
            <p className="px-3 pb-3 text-sm text-gray-500">Loading...</p>
          ) : count === 0 ? (
            <p className="px-3 pb-3 text-sm text-gray-500">You're all caught up.</p>
          ) : (
            <>
              {overdue > 0 && (
                <button
                  type="button"
                  onClick={showOverdue}
                  className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-gray-50"
                >
                  <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                  <span>
                    <span className="block text-sm font-medium text-gray-800">
                      {overdue} overdue {overdue === 1 ? "task" : "tasks"}
                    </span>
                    <span className="block text-xs text-gray-400">Past their due date</span>
                  </span>
                </button>
              )}
              {dueToday > 0 && (
                <button
                  type="button"
                  onClick={showCalendar}
                  className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-gray-50"
                >
                  <CalendarClock size={18} className="text-amber-500 mt-0.5 shrink-0" />
                  <span>
                    <span className="block text-sm font-medium text-gray-800">
                      {dueToday} {dueToday === 1 ? "task" : "tasks"} due today
                    </span>
                    <span className="block text-xs text-gray-400">See them on the calendar</span>
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileMenu({ user }) {
  const handleLogout = useLogout();
  const { isOpen, close, containerRef, buttonProps, panelId } = useDropdown();

  return (
    <div ref={containerRef} className="relative">
      <button
        {...buttonProps}
        aria-label="Account menu"
        className="flex items-center gap-3 rounded-lg p-1 hover:bg-gray-50"
      >
        <Avatar name={user.name} />
        <span className="hidden lg:block text-left">
          <span className="block text-sm font-semibold text-gray-700">{user.name}</span>
          <span className="block text-xs text-gray-400 capitalize">{user.role}</span>
        </span>
        <ChevronDown size={16} className="hidden lg:block text-gray-400" />
      </button>

      {isOpen && (
        <div
          id={panelId}
          className="absolute right-0 mt-2 w-60 rounded-xl border border-gray-100 bg-white shadow-lg p-2"
        >
          <div className="px-3 py-2 border-b border-gray-100 mb-1">
            <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
          <Link
            to="/settings"
            onClick={close}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            <Settings size={16} />
            Settings
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default Header;
