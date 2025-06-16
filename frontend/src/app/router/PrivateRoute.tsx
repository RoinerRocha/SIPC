import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/configureStore';

interface ProtectedRouteProps {
  requiredPermissions?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredPermissions }) => {
  const { isAuthenticated, user } = useAppSelector(state => state.account);
  const location = useLocation();

  if (user === null && isAuthenticated === false) {
    return null; // También podrías usar <LoadingComponent message="Verificando autenticación..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/Ingreso" />;
  }

  if (requiredPermissions && !requiredPermissions.some(permission => user?.permisos?.includes(permission))) {
    return <Navigate to="/" />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;