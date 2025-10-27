// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api } from '@/lib/api'; // Sua instância Axios
import { getUserApi, loginApi, logoutApi, User, LoginResponse } from '@/lib/authApi'; // Importa as funções da API

// --- INTERFACES ---
// Usaremos a interface User exportada de authApi.ts
export type AuthUser = User;

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>; // Aceita as credenciais
  logout: () => void;
  isLoading: boolean; // Renomeado de 'loading' para consistência
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- PROVEDOR DE AUTENTICAÇÃO ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Começa como true

  // Chave para guardar o token no localStorage
  const TOKEN_KEY = 'authToken';
  const USER_KEY = 'authUser';

  // Função para aplicar o token/usuário no estado, Axios e localStorage
  const applyAuth = useCallback((newToken: string | null, newUser: AuthUser | null) => {
    if (newToken && newUser) {
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser)); // Guarda o usuário como JSON
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`; // Define o header no Axios
      setToken(newToken);
      setUser(newUser);
    } else {
      // Limpa tudo se token ou user forem nulos
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      delete api.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
    }
  }, []); // Sem dependências, pois usa apenas argumentos

  // Função para limpar o estado localmente (usada no logout e em caso de erro de verificação)
  const handleLogoutLocally = useCallback(() => {
    applyAuth(null, null); // Chama applyAuth com null para limpar tudo
     // Idealmente, o roteamento deve ser feito nos componentes que chamam logout,
     // mas pode forçar aqui se necessário:
     // window.location.href = "/auth";
  }, [applyAuth]);

  // Função para verificar se existe um token válido no localStorage ao carregar
  const verifyAuth = useCallback(async () => {
    setIsLoading(true);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    // Tenta pegar o usuário do localStorage primeiro para uma UI mais rápida
    const storedUserJson = localStorage.getItem(USER_KEY);
    let initialUser: AuthUser | null = null;
    if (storedUserJson) {
        try {
            initialUser = JSON.parse(storedUserJson);
        } catch (e) { console.error("Erro ao parsear usuário do localStorage", e); }
    }


    if (storedToken) {
      // Define o token no Axios imediatamente para a chamada getUserApi funcionar
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      try {
        // Tenta verificar o token chamando /api/user
        const fetchedUser = await getUserApi();
        // Se a chamada for bem-sucedida, atualiza o estado e localStorage
        applyAuth(storedToken, fetchedUser);
      } catch (error) {
        console.error("Falha ao verificar token:", error);
        // Se /api/user falhar (token expirado/inválido), limpa tudo
        handleLogoutLocally();
      }
    } else {
        // Se não há token, garante que tudo está limpo
        handleLogoutLocally();
    }
    setIsLoading(false);
  }, [applyAuth, handleLogoutLocally]); // Inclui dependências

  // Função de Login
const login = async (credentials: any): Promise<void> => {
    setIsLoading(true); // Define loading como true no início
    try {
      const response: LoginResponse = await loginApi(credentials);
      if (response.token && response.user) {
         applyAuth(response.token, response.user);
         // ---> ADICIONE ESTA LINHA <---
         setIsLoading(false); // Define loading como false após sucesso
         // ---> FIM DA ADIÇÃO <---
      } else {
         setIsLoading(false); // Também defina como false se a resposta for inválida
         throw new Error("Resposta inválida do servidor ao fazer login.");
      }
    } catch (error) {
       console.error('Falha no login (AuthContext):', error);
       handleLogoutLocally();
       setIsLoading(false); // Já estava correto aqui no erro
       throw error;
    }
    // Remova setIsLoading(false) daqui se existir fora do try/catch
  };

  // Função de Logout
  const logout = async () => {
    setIsLoading(true);
    const currentToken = localStorage.getItem(TOKEN_KEY);
    if (currentToken) {
        try {
            // Tenta invalidar o token no backend
            await logoutApi();
        } catch (error) {
            console.error("Erro ao fazer logout no servidor (token pode já estar inválido), limpando localmente.", error);
        }
    }
    // Sempre limpa localmente, mesmo se a chamada API falhar
    handleLogoutLocally();
    setIsLoading(false);
    // O redirecionamento pode ser feito aqui ou no componente que chama logout
    // window.location.href = "/auth";
  };

  // Executa a verificação de autenticação uma vez quando o provider monta
  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]); // Executa quando verifyAuth muda (que é nunca, devido ao useCallback sem deps)

  // Calcula isAuthenticated baseado no estado atual
  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        logout,
        isLoading // Usa isLoading
      }}>
      {!isLoading ? children : <div>Carregando Autenticação...</div>} {/* Mostra loading ou children */}
    </AuthContext.Provider>
  );
};

// --- HOOK CUSTOMIZADO ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};