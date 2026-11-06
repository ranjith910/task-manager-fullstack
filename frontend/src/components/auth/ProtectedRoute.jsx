import { Navigate, Outlet, useLocation } from "react-router";
import { useSelector } from "react-redux";

// only for logged in users, everyone else goes to /login (and comes back after logging in)
function ProtectedRoute() {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

export default ProtectedRoute;
