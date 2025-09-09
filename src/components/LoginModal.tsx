import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, UserCheck, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const handleClientAccess = () => {
    alert('Redirecionando para área do cliente...');
    onClose();
  };

  const handleCollaboratorAccess = () => {
    alert('Redirecionando para área do colaborador...');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gradient">
            Área do Cliente
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 p-6">
          <Card className="card-tech cursor-pointer hover:scale-105 transition-transform" onClick={handleClientAccess}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center shadow-xl">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-xl font-bold text-foreground">
                Portal do Cliente
              </CardTitle>
              <CardDescription>
                Acesse seus projetos e serviços
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="btn-tech w-full group">
                Acessar
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <ul className="text-left space-y-2 text-muted-foreground mt-4 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Acompanhar projetos
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Solicitar serviços
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Histórico de atendimentos
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-tech cursor-pointer hover:scale-105 transition-transform" onClick={handleCollaboratorAccess}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-primary/30 rounded-xl flex items-center justify-center">
                <UserCheck className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold text-foreground">
                Portal do Colaborador
              </CardTitle>
              <CardDescription>
                Acesso interno da equipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full group">
                Acessar
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <ul className="text-left space-y-2 text-muted-foreground mt-4 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Gestão de projetos
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Relatórios técnicos
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Sistema interno
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};