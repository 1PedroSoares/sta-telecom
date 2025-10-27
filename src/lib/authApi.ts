// src/lib/authApi.ts
import { api } from '@/lib/api'; // Ajuste o caminho se necessário
import { AxiosResponse } from 'axios';

// Interface adaptada para a resposta do seu AuthController.php CEMIG
// Baseado no seu UserResource e AuthController
export interface User {
    id: number;
    nome: string; // Ou 'name' dependendo do seu UserResource/AuthController
    email: string;
    role: 'cliente' | 'gestor'; // Ou 'role' dependendo do seu UserResource/AuthController
    data_criacao?: string; // Opcional, se retornado
    // Remova ou adicione campos conforme retornado pelo seu AuthController
}

// Interface para a resposta do endpoint /api/login
export interface LoginResponse {
  user: User;
  token: string;
}

// Função para chamar o endpoint de login
export const loginApi = async (credentials: any): Promise<LoginResponse> => {
    // A rota de login é /api/login (relativa ao baseURL do api.ts)
    const response: AxiosResponse<LoginResponse> = await api.post('/login', credentials);
    return response.data;
};

// Função para chamar o endpoint de logout
export const logoutApi = async (): Promise<void> => {
    // Rota de logout é /api/logout
    await api.post('/logout');
};

// Função para chamar o endpoint /api/user para verificar o token/usuário
export const getUserApi = async (): Promise<User> => { // Ajustado para retornar apenas User
    // Rota de verificação é /api/user
    const response: AxiosResponse<User> = await api.get('/user'); // Assumindo que /api/user retorna diretamente o objeto User (ou UserResource)
    return response.data;
};