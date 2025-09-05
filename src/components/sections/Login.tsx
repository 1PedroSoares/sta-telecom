import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, UserCheck, ArrowRight } from 'lucide-react';

export const Login = () => {
  const handleLogin = () => {
    // Futuramente redirecionará para página de login/cadastro
    alert('Em breve você poderá acessar sua área personalizada!');
  };

  return (
    <section id="login" className="py-20 bg-gradient-to-br from-primary/5 to-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
            Área do Cliente
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Acesse sua área personalizada para acompanhar projetos, solicitar serviços 
            e manter contato direto com nossa equipe técnica.
          </p>

          {/* Main Login Card */}
          <Card className="card-tech max-w-2xl mx-auto mb-12">
            <CardHeader className="text-center pb-8">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center shadow-xl">
                <User className="w-12 h-12 text-primary-foreground" />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">
                Portal STA
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Seu portal de acesso aos serviços STA Telecomunicações
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pb-8">
              <Button 
                onClick={handleLogin}
                className="btn-tech w-full text-lg py-6 mb-6 group"
              >
                Acessar Portal
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Em breve você poderá escolher entre acesso como Cliente ou Colaborador
              </p>
            </CardContent>
          </Card>

          {/* Future Features Preview */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="card-tech">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-primary/30 rounded-xl flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">
                  Área do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    Acompanhar status de projetos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    Solicitar novos serviços
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    Histórico de atendimentos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    Documentos e relatórios
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-tech">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-primary/30 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">
                  Área do Colaborador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    Gestão de projetos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    Relatórios técnicos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    Controle de qualidade
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    Sistema interno
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};