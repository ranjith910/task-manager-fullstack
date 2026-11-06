import { useEffect } from "react";
import { Route, Routes } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import GuestRoute from "./components/auth/GuestRoute";
import FullPageLoader from "./components/ui/FullPageLoader";
import ServerUnavailable from "./components/ui/ServerUnavailable";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import { fetchCurrentUser } from "./redux/slices/authSlice";

function App() {
  const dispatch = useDispatch();
  const { initialized, sessionError } = useSelector((state) => state.auth);

  // the auth cookie is httpOnly, so ask the API who we are
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  if (!initialized) {
    return sessionError ? (
      <ServerUnavailable message={sessionError} onRetry={() => dispatch(fetchCurrentUser())} />
    ) : (
      <FullPageLoader />
    );
  }

  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
