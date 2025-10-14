import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Calendar, FileImage, Upload, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ServiceOrder {
  id: string;
  os_number: string;
  title: string;
  description: string;
  start_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress_images: string[];
  report_images: string[];
}

// Mock data
const mockServiceOrders: ServiceOrder[] = [
  {
    id: '1',
    os_number: 'OS-2024-001',
    title: 'Instalação de Torre de Telecomunicações',
    description: 'Instalação completa de torre de 50m com equipamentos de transmissão na região metropolitana.',
    start_date: '2024-01-15',
    status: 'in_progress',
    progress_images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400'
    ],
    report_images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
    ]
  },
  {
    id: '2',
    os_number: 'OS-2024-002',
    title: 'Manutenção de Rede Fibra Óptica',
    description: 'Reparo e manutenção preventiva da rede de fibra óptica no centro da cidade.',
    start_date: '2024-02-20',
    status: 'completed',
    progress_images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400',
      'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=400'
    ],
    report_images: [
      'https://images.unsplash.com/photo-1516383740770-fbcc5ccbece0?w=400'
    ]
  },
  {
    id: '3',
    os_number: 'OS-2024-003',
    title: 'Expansão de Cobertura 5G',
    description: 'Implementação de nova infraestrutura para cobertura 5G na zona sul.',
    start_date: '2024-03-10',
    status: 'pending',
    progress_images: [],
    report_images: []
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Simulate loading
    setTimeout(() => {
      setServiceOrders(mockServiceOrders);
      setLoading(false);
    }, 1000);
  }, [user, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
      case 'in_progress':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'in_progress':
        return 'Em Andamento';
      default:
        return 'Pendente';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <header className="bg-card/80 backdrop-blur-md border-b border-border shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {user?.role === 'employee' ? 'Portal do Colaborador' : 'Portal do Cliente'}
            </h1>
            <p className="text-muted-foreground">Bem-vindo, {user?.fullName}</p>
          </div>
          <div className="flex items-center gap-4">
            {user?.role === 'employee' && (
              <Button onClick={() => navigate('/upload')} className="gap-2 bg-primary hover:bg-primary/90">
                <Upload className="w-4 h-4" />
                Nova OS
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold mb-2 text-foreground">Ordens de Serviço</h2>
          <p className="text-muted-foreground">
            Acompanhe o andamento dos projetos e visualize relatórios detalhados
          </p>
        </div>

        {serviceOrders.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2">
            <div className="mx-auto w-20 h-20 mb-4 bg-muted/50 rounded-full flex items-center justify-center">
              <FileImage className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Nenhuma ordem de serviço encontrada</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {user?.role === 'employee' 
                ? 'Comece criando uma nova ordem de serviço para seus clientes.'
                : 'Aguarde a criação de ordens de serviço pela nossa equipe.'
              }
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
            {serviceOrders.map((order, idx) => (
              <Card 
                key={order.id} 
                className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <CardHeader className="bg-gradient-to-br from-card to-muted/30 pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg text-foreground line-clamp-2">{order.title}</CardTitle>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm text-muted-foreground font-mono">
                    {order.os_number}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>Início: {format(new Date(order.start_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                  </div>
                  
                  <p className="text-sm line-clamp-3 text-foreground/80">{order.description}</p>

                  {order.progress_images.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                        <Eye className="w-4 h-4 text-primary" />
                        Progresso ({order.progress_images.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {order.progress_images.slice(0, 2).map((image, index) => (
                          <div 
                            key={index}
                            className="relative group overflow-hidden rounded-lg border border-border/50"
                          >
                            <img
                              src={image}
                              alt={`Progresso ${index + 1}`}
                              className="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors" />
                          </div>
                        ))}
                        {order.progress_images.length > 2 && (
                          <div className="bg-muted/50 rounded-lg border border-dashed border-border flex items-center justify-center text-sm font-medium text-muted-foreground">
                            +{order.progress_images.length - 2}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {order.report_images.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                        <FileImage className="w-4 h-4 text-primary" />
                        Relatórios ({order.report_images.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {order.report_images.slice(0, 2).map((image, index) => (
                          <div 
                            key={index}
                            className="relative group overflow-hidden rounded-lg border border-border/50"
                          >
                            <img
                              src={image}
                              alt={`Relatório ${index + 1}`}
                              className="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button variant="outline" className="w-full gap-2 mt-4 hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Eye className="w-4 h-4" />
                    Ver Detalhes Completos
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}