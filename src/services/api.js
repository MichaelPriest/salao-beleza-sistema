import axios from 'axios';

// Detectar ambiente
const isProduction = process.env.NODE_ENV === 'production';

const api = axios.create({
  baseURL: isProduction 
    ? 'https://salao-beleza-sistema.vercel.app/api'  // URL do Vercel com /api
    : 'http://localhost:3001/api',                    // Local com /api
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para log de requisições
api.interceptors.request.use(request => {
  console.log('🚀 Requisição:', request.method.toUpperCase(), request.baseURL + request.url);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('✅ Resposta:', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('❌ Erro na requisição:', {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default api;
