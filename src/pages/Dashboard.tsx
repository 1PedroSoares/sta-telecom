import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, FileText, Image, LogOut, Plus, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ServiceOrder {
  id: string;
  os_number: string;
  title: string;
  description: string;
  start_date: string;
  status: 'em_andamento' | 'concluido' | 'cancelado';
  created_at: string;
  service_images: {
    id: string;
    image_url: string;
    image_type: 'progress' | 'report';
    description: string;
    uploaded_at: string;
  }[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      fetchServiceOrders();
    }
  }, [user, loading, navigate]);

  const fetchServiceOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          service_images (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServiceOrders(data as ServiceOrder[] || []);
    } catch (error) {
      console.error('Erro ao carregar ordens de serviço:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return 'bg-yellow-500';
      case 'concluido':
        return 'bg-green-500';
      case 'cancelado':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return 'Em Andamento';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading || loadingOrders) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {profile?.role === 'employee' ? 'Portal do Colaborador' : 'Portal do Cliente'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Bem-vindo, {profile?.full_name || user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {profile?.role === 'employee' && (
                <Button onClick={() => navigate('/upload')} className="mr-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Serviço
                </Button>
              )}
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Ordens de Serviço</h2>
          <p className="text-muted-foreground">
            {profile?.role === 'employee' 
              ? 'Gerencie e acompanhe todas as ordens de serviço'
              : 'Acompanhe o andamento dos seus serviços'
            }
          </p>
        </div>

        {serviceOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma ordem de serviço encontrada</h3>
              <p className="text-muted-foreground">
                {profile?.role === 'employee'
                  ? 'Crie sua primeira ordem de serviço clicando no botão "Novo Serviço"'
                  : 'Suas ordens de serviço aparecerão aqui quando disponíveis'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {serviceOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{order.title}</CardTitle>
                      <CardDescription className="mt-1">
                        OS: {order.os_number}
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} text-white`}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      Início: {format(new Date(order.start_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                    
                    {order.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {order.description}
                      </p>
                    )}

                    {order.service_images.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center text-sm font-medium">
                          <Image className="w-4 h-4 mr-2" />
                          Imagens ({order.service_images.length})
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {order.service_images.slice(0, 3).map((img) => (
                            <img
                              key={img.id}
                              src={img.image_url}
                              alt={img.description || 'Imagem do serviço'}
                              className="w-full h-16 object-cover rounded border"
                            />
                          ))}
                          {order.service_images.length > 3 && (
                            <div className="w-full h-16 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground">
                              +{order.service_images.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}