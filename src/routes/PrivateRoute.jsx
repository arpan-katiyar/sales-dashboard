import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const PrivateRoute = ({ requiredRoles }) => {
  const { auth, status } = useAuth();

  if (status === "checking") {
    return <div className="p-4 text-gray-500">Loading...</div>;
  }

  if (!auth?.userId) {
    return <Navigate to="/" replace />;
  }

  const roles = Array.isArray(auth.role) ? auth.role : [];
  if (requiredRoles && !requiredRoles.some((role) => roles.includes(role))) {
    return <div>Unauthorized</div>;
  }

  return <Outlet />;
};

export default PrivateRoute;
