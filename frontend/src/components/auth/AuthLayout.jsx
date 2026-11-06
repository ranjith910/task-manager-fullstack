import { CalendarDays, CheckCircle2, ListFilter } from "lucide-react";
import Logo from "../ui/Logo";

const FEATURES = [
  { icon: CheckCircle2, text: "Track every task from pending to done" },
  { icon: ListFilter, text: "Search, filter and sort in seconds" },
  { icon: CalendarDays, text: "See what's due on a calendar" },
];

function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <div className="hidden lg:flex flex-col justify-between bg-indigo-600 p-12 text-white">
        <Logo light />

        <div>
          <h2 className="text-4xl font-bold leading-tight">Make every task count.</h2>
          <p className="mt-4 text-indigo-100 max-w-md">
            Plan your work, keep an eye on deadlines and see your progress at a glance.
          </p>
          <ul className="mt-10 space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-indigo-50">
                <span className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                  <Icon size={18} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-indigo-200">© {new Date().getFullYear()} Tasknix</p>
      </div>

      <main className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">
          <Logo className="lg:hidden mb-10" />
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-sm text-center text-gray-500">{footer}</p>
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;
