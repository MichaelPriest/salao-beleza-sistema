// src/components/SaasAdminRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { usuariosService } from '../services/usuariosService';
import { isSaasPlatformAdmin } from '../utils/saasAccess';

function SaasAdminRoute({ children }) {
  const usuario = usuariosService.getUsuarioAtual();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!isSaasPlatformAdmin(usuario)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}

export default SaasAdminRoute;
