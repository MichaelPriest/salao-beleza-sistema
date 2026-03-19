import axios from 'axios';

// Determinar a URL base baseado no ambiente
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    // Em produção, usa a URL do Vercel
    return 'https://salao-beleza-sistema.vercel.app/api';
  }
  // Em desenvolvimento, usa localhost
  return 'http://localhost:3001/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000, // Aumentei para 15 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para log de requisições
api.interceptors.request.use(request => {
  console.log('🚀 Requisição:', request.method.toUpperCase(), request.baseURL + request.url);
  console.log('📦 Dados:', request.data);
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
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // Se for erro de rede, mostrar mensagem mais amigável
    if (error.message === 'Network Error') {
      console.error('🔌 Erro de rede - API não está acessível');
    }
    
    return Promise.reject(error);
  }
);

export default api;
