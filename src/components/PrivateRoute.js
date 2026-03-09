import React from 'react';
import { Navigate } from 'react-router-dom';
import { usuariosService } from '../services/usuariosService';

function PrivateRoute({ children }) {
  const usuario = usuariosService.getUsuarioAtual();
  
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default PrivateRoute;