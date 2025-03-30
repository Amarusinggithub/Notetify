import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  if (
    localStorage.getItem("access_token") == null ||
    localStorage.getItem("access_token") == ""
  ) {
    return <Navigate to="/login" />;
  }
  return <Outlet />;
};

export default PrivateRoute;
