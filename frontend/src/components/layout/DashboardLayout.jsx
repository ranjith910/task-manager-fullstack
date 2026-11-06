import Sidebar from "./Sidebar";
import Header from "./Header";

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Header />

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
