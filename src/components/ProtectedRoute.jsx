import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    // If user is not logged in, redirect to the homepage.
    return <Navigate to="/" replace />;
  }

  // If allowedRoles are specified, check if the user's role is included.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user's role is not allowed, redirect to their default dashboard or homepage.
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
