import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { logout } from "../redux/slices/authSlice";

export default function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return async () => {
    const result = await dispatch(logout());
    navigate("/login", { replace: true });

    if (logout.rejected.match(result)) {
      // the cookie is httpOnly, so only the server can remove it
      toast.error("Couldn't reach the server, you may still be logged in on this browser");
    } else {
      toast.success("You've been logged out");
    }
  };
}
