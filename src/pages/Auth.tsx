// src/pages/Auth.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User } from 'lucide-react';

export default function AuthPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();


const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    console.log('Tentando login com:', { email, password });
    try {
      // --- CORREÇÃO AQUI ---
      // Passe um objeto contendo email e password
      await login({ email, password });
      // --- FIM DA CORREÇÃO ---

      toast({
        title: 'Login realizado com sucesso!',
        description: 'Redirecionando...',
      });
    } catch (err: any) {
      // ... (código de tratamento de erro) ...
       console.error("Login failed in AuthPage:", err);
       let errorMessage = 'Credenciais inválidas. Tente novamente.';
       if (err.response && err.response.status === 422 && err.response.data.errors) {
          const errors = err.response.data.errors;
          errorMessage = Object.values(errors).flat().join(' ');
       } else if (err.message) {
          errorMessage = err.message;
       }
       setError(errorMessage);
       toast({
         title: 'Erro no login',
         description: errorMessage,
         variant: 'destructive',
       });
    }
  };

useEffect(() => {
  if (User) { // <--- Problem: 'User' is not defined here
    navigate('/dashboard'); // This is line 36
  }
}, [User, navigate]); // <-- Problem: 'User' is not defined here

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   const { error } = await signIn(loginForm.email, loginForm.password);

  //   if (error) {
  //     toast({
  //       title: 'Erro no login',
  //       description: error.message,
  //       variant: 'destructive',
  //     });
  //   } else {
  //     toast({
  //       title: 'Login realizado com sucesso!',
  //       description: 'Redirecionando para o dashboard...',
  //     });
  //   }
  //   setLoading(false);
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao site
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Portal de Acesso
            </CardTitle>
            <CardDescription>
              Acesse sua conta para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
           <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email} // <-- CORRIGIDO
                  onChange={(e) => setEmail(e.target.value)} // <-- CORRIGIDO
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password} // <-- CORRIGIDO
                  onChange={(e) => setPassword(e.target.value)} // <-- CORRIGIDO
                  required
                  disabled={isLoading}
                />
              </div>
             <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}