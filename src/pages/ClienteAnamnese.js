// src/pages/ClienteAnamnese.js
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthCliente } from '../contexts/AuthClienteContext';

function ClienteAnamnese() {
  console.log('🔥 COMPONENTE MÍNIMO CARREGADO!');
  
  const navigate = useNavigate();
  const params = useParams();
  const auth = useAuthCliente();
  
  console.log('📌 Params:', params);
  console.log('📌 Auth:', auth);

  return (
    <div style={{ padding: '20px' }}>
      <h1>✅ TESTE: Componente de Anamnese</h1>
      <p>Se você está vendo esta mensagem, o componente está funcionando!</p>
      <p>Params: {JSON.stringify(params)}</p>
      <button onClick={() => navigate('/cliente/anamnese')}>
        Voltar
      </button>
    </div>
  );
}

export default ClienteAnamnese;
