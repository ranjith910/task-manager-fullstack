import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { fetchTaskStats } from "../../redux/slices/taskSlice";

function DashboardLayout() {
  const dispatch = useDispatch();
  const version = useSelector((state) => state.tasks.version);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // stats are loaded here because both the header (notifications) and the dashboard use them
  useEffect(() => {
    const request = dispatch(fetchTaskStats());
    return () => request.abort();
  }, [dispatch, version]);

  useEffect(() => {
    if (!isSidebarOpen) return;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsSidebarOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isSidebarOpen]);

  return (
    <div id="app-shell" className="min-h-screen flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main id="main-content" tabIndex={-1} className="flex-1 p-4 sm:p-6 lg:p-8 outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
