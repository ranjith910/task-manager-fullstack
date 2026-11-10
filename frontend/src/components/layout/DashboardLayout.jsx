import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { fetchTaskStats } from "../../redux/slices/taskSlice";

function DashboardLayout() {
  const dispatch = useDispatch();
  const version = useSelector((state) => state.tasks.version);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const mainColumnRef = useRef(null);

  // stats are loaded here because both the header (notifications) and the dashboard use them
  useEffect(() => {
    const request = dispatch(fetchTaskStats());
    return () => request.abort();
  }, [dispatch, version]);

  // on small screens the sidebar is a drawer over the page, so treat it like a modal
  useEffect(() => {
    if (!isSidebarOpen) return;

    const mainColumn = mainColumnRef.current;
    const menuButton = menuButtonRef.current;
    mainColumn.setAttribute("inert", "");
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsSidebarOpen(false);
    };
    // the drawer doesn't exist on large screens, close it if the window grows
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = (event) => {
      if (event.matches) setIsSidebarOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    desktop.addEventListener("change", closeOnDesktop);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      desktop.removeEventListener("change", closeOnDesktop);
      mainColumn.removeAttribute("inert");
      document.body.style.overflow = "";
      menuButton?.focus();
    };
  }, [isSidebarOpen]);

  return (
    <div id="app-shell" className="min-h-screen flex">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        closeButtonRef={closeButtonRef}
      />

      <div ref={mainColumnRef} className="flex-1 min-w-0 flex flex-col">
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          isMenuOpen={isSidebarOpen}
          menuButtonRef={menuButtonRef}
        />
        <main id="main-content" tabIndex={-1} className="flex-1 p-4 sm:p-6 lg:p-8 outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
