import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/configureStore';

interface ProtectedRouteProps {
  requiredPermissions?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredPermissions }) => {
  const { isAuthenticated, user } = useAppSelector(state => state.account);
  const location = useLocation();
  console.log("🔐 Usuario en Redux:", user);
  console.log("🔑 Permisos del usuario:", user?.permisos);

  if (!isAuthenticated) {
    return <Navigate to="/Ingreso" />;
  }

  if (requiredPermissions && !requiredPermissions.some(permission => user?.permisos?.includes(permission))) {
    return <Navigate to="/" />;
  }
  return <Outlet />;
};

export default ProtectedRoute;