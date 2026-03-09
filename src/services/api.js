import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001', // Porta 3001 conforme seu server.js
  timeout: 10000,
});

// Interceptor para log de requisições
api.interceptors.request.use(request => {
  console.log('🚀 Requisição:', request.method.toUpperCase(), request.url);
  console.log('📦 Dados:', request.data);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('✅ Resposta:', response.status);
    return response;
  },
  error => {
    console.error('❌ Erro na requisição:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default api;