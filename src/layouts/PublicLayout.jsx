import { Suspense } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const PublicLayout = () => {
  const { auth, status } = useAuth();
  const lastRoute = localStorage.getItem("lastRoute");

  if (status === "checking") {
    return <div className="p-4 text-gray-500">Loading...</div>;
  }

  if (auth?.userId) {
    return (
      <Navigate
        to={lastRoute && lastRoute !== "/" ? lastRoute : "/suppliers"}
        replace
      />
    );
  }

  return (
    <Suspense fallback={<div className="p-4 text-gray-500">Loading...</div>}>
      <Outlet />
    </Suspense>
  );
};

export default PublicLayout;
