import { Navigate, Outlet } from "react-router-dom";
import React from "react";


const PrivateRoute = () => {
  if (localStorage.getItem("access_token") == null) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default PrivateRoute;
