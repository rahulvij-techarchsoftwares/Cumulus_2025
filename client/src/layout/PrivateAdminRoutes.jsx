import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateAdminRoute = ({ children }) => {
  const role = localStorage.getItem("role") || "";
  const token = localStorage.getItem("token");
  const isAuthenticated = role === "Admin" && token;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default PrivateAdminRoute;
