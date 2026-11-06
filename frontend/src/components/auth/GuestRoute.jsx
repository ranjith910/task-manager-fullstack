import { Navigate, Outlet, useLocation } from "react-router";
import { useSelector } from "react-redux";

// login/register pages: a logged in user is sent to where they were going (or home)
function GuestRoute() {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  if (user) {
    const from = location.state?.from;
    return <Navigate to={from ? `${from.pathname}${from.search || ""}` : "/"} replace />;
  }
  return <Outlet />;
}

export default GuestRoute;
