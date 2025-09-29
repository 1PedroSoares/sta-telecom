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
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      default:
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {user?.role === 'employee' ? 'Portal do Colaborador' : 'Portal do Cliente'}
            </h1>
            <p className="text-muted-foreground">Bem-vindo, {user?.fullName}</p>
          </div>
          <div className="flex items-center gap-4">
            {user?.role === 'employee' && (
              <Button onClick={() => navigate('/upload')} className="gap-2">
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Ordens de Serviço</h2>
          <p className="text-muted-foreground">
            Acompanhe o andamento dos projetos e visualize relatórios
          </p>
        </div>

        {serviceOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="mx-auto w-16 h-16 mb-4 bg-muted rounded-full flex items-center justify-center">
              <FileImage className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhuma ordem de serviço encontrada</h3>
            <p className="text-muted-foreground">
              {user?.role === 'employee' 
                ? 'Comece criando uma nova ordem de serviço.'
                : 'Aguarde a criação de ordens de serviço pela equipe.'
              }
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {serviceOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg">{order.title}</CardTitle>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm text-muted-foreground">
                    OS: {order.os_number}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Início: {format(new Date(order.start_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                  
                  <p className="text-sm line-clamp-2">{order.description}</p>

                  {order.progress_images.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Imagens do Progresso ({order.progress_images.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {order.progress_images.slice(0, 2).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Progresso ${index + 1}`}
                            className="w-full h-20 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        ))}
                        {order.progress_images.length > 2 && (
                          <div className="bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">
                            +{order.progress_images.length - 2} mais
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {order.report_images.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <FileImage className="w-4 h-4" />
                        Relatórios ({order.report_images.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {order.report_images.slice(0, 2).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Relatório ${index + 1}`}
                            className="w-full h-20 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <Button variant="outline" className="w-full gap-2">
                    <Eye className="w-4 h-4" />
                    Ver Detalhes
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