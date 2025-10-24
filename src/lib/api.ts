import axios from 'axios';

// Cria uma instância do Axios
export const api = axios.create({
    // Pega o URL do backend do nosso arquivo .env.local
    baseURL: import.meta.env.VITE_API_BASE_URL,

    // ESSENCIAL: Permite que o Axios envie e receba cookies
    // entre o frontend (localhost:5173) e o backend (127.0.0.1:8000)
    withCredentials: true,

    headers: {
        'Accept': 'application/json',
    }
});

// Interceptor para pegar o token CSRF
// O Laravel/Sanctum precisa disso para proteger contra ataques CSRF.
api.interceptors.request.async(async (config) => {
    if (config.method === 'get' || config.method === 'head') {
        // Para requisições 'get', primeiro pegamos o cookie CSRF
        // para garantir que ele esteja disponível para futuras requisições 'post'.
        try {
            await axios.get(`${import.meta.env.VITE_API_BASE_URL}/sanctum/csrf-cookie`, {
                withCredentials: true,
            });
        } catch (error) {
            console.error('Erro ao buscar cookie CSRF', error);
        }
    }
    return config;
});