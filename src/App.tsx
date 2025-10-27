// sta/src/App.tsx

// ATUALIZE ESTE ARQUIVO: src/App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
// import Upload from "./pages/Upload"; // Removido
import FileManager from "./pages/FileManager";
import NotFound from "./pages/NotFound";
import React from "react";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Pode mostrar um spinner de loading global aqui enquanto verifica a auth
    return <div>Verificando autenticação...</div>;
  }

  if (!isAuthenticated) {
    // Redireciona para /auth se não estiver autenticado
    return <Navigate to="/auth" replace />;
  }

  // Renderiza o componente filho (Dashboard, FileManager) se autenticado
  return children;
};

// Componente wrapper para Rota de Autenticação (impede acesso se já logado)
const AuthRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div>Verificando autenticação...</div>;
    }

    if (isAuthenticated) {
        // Redireciona para /dashboard se já estiver autenticado
        return <Navigate to="/dashboard" replace />;
    }

    // Renderiza o componente de autenticação se não estiver logado
    return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* AuthProvider deve vir por fora para que useAuth funcione nos wrappers */}
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />

            {/* Rota de Autenticação: Só acessível se NÃO estiver logado */}
            <Route
              path="/auth"
              element={
                <AuthRoute>
                  <Auth />
                </AuthRoute>
              }
            />

            {/* Rotas Protegidas: Só acessíveis se ESTIVER logado */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/file-manager"
              element={
                <ProtectedRoute>
                  <FileManager />
                </ProtectedRoute>
              }
            />

            {/* Rota Catch-all para páginas não encontradas */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;