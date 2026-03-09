import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://salao-beleza-sistema.vercel.app/api' 
    : 'http://localhost:3001', // SEM o /api no final
  timeout: 10000,
});

// Interceptor para log de requisições
api.interceptors.request.use(request => {
  console.log('🚀 Requisição:', request.method.toUpperCase(), request.url);
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
