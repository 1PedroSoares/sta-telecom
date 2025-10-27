import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
// Cria uma instância do Axios
export const api = axios.create({
    // Pega o URL do backend do nosso arquivo .env.local
    baseURL: `${BASE_URL}`,

    // ESSENCIAL: Permite que o Axios envie e receba cookies
    // entre o frontend (localhost:5173) e o backend (127.0.0.1:8000)
    // withCredentials: true,

    headers: {
        'Accept': 'application/json',
    }
});

// Interceptor para pegar o token CSRF
// O Laravel/Sanctum precisa disso para proteger contra ataques CSRF.
api.interceptors.request.use(
   (config) => {
     const token = localStorage.getItem('authToken'); // Ou 'token'

     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     // Garante Content-Type para métodos relevantes
     if ((config.method === 'post' || config.method === 'put' || config.method === 'patch') && config.data) {
          if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) { // Não define para FormData
             config.headers['Content-Type'] = 'application/json';
          }
     }
     config.headers['Accept'] = 'application/json';
     config.headers['X-Requested-With'] = 'XMLHttpRequest';

     console.log('Axios Request Config:', config);
     return config;
   },
   (error) => {
     console.error('Axios Request Interceptor Error:', error);
     return Promise.reject(error);
   }
 );