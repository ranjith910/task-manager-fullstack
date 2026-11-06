import { Link } from "react-router";
import Logo from "../components/ui/Logo";
import useDocumentTitle from "../hooks/useDocumentTitle";

function NotFound() {
  useDocumentTitle("Page not found");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <Logo />
      <p className="mt-10 text-sm font-semibold text-indigo-600">404</p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-2 text-sm text-gray-500">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="mt-8 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Back to dashboard
      </Link>
    </main>
  );
}

export default NotFound;
