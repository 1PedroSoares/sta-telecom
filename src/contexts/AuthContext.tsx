import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api'; // Nosso novo cliente Axios!

// 1. Defina o tipo de usuário baseado no seu UserResource do Laravel
interface User {
  id: number;
  nome: string;
  email: string;
  perfil: 'cliente' | 'gestor'; // Do seu UserResource
  data_criacao: string;
}

// 2. Defina o que o Contexto irá prover
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 3. Função para verificar se o usuário já está logado (chamada no início)
  const checkAuth = async () => {
    setIsLoading(true);
    try {
      // O backend (Laravel) nos dirá quem é o usuário
      // baseado no cookie de sessão.
      const response = await api.get('/api/user');
      setUser(response.data);
    } catch (error) {
      // Se der erro (ex: 401), o usuário não está logado
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Executa a verificação de auth assim que o app carregar
  useEffect(() => {
    checkAuth();
  }, []);

  // 5. Função de Login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // 1. Pega o cookie CSRF (necessário antes do POST)
      await api.get('/sanctum/csrf-cookie');

      // 2. Chama a rota de login do Laravel
      const response = await api.post('/api/login', { email, password });

      // 3. Define o usuário no estado
      setUser(response.data);
    } catch (error) {
      console.error('Falha no login:', error);
      setUser(null);
      throw error; // Lança o erro para a página de login tratar
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Função de Logout
  const logout = async () => {
    setIsLoading(true);
    try {
      // Chama a rota de logout do Laravel
      await api.post('/api/logout');
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      // Limpa o usuário do estado local
      setUser(null);
      setIsLoading(false);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso do contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};