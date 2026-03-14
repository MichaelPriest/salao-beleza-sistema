// src/components/ClientePrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthCliente } from '../contexts/AuthClienteContext';

function ClientePrivateRoute({ children }) {
  const { isAuthenticated, loading, cliente } = useAuthCliente();
  const location = useLocation();

  console.log('🔐 ClientePrivateRoute - Verificando acesso:', location.pathname);
  console.log('🔐 ClientePrivateRoute - Autenticado:', isAuthenticated);
  console.log('🔐 ClientePrivateRoute - Cliente:', cliente);
  console.log('🔐 ClientePrivateRoute - Loading:', loading);

  if (loading) {
    return <div>Carregando...</div>; // Ou seu componente de loading
  }

  if (!isAuthenticated) {
    console.log('🔐 ClientePrivateRoute - Redirecionando para login do cliente');
    return <Navigate to="/cliente/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ClientePrivateRoute;
