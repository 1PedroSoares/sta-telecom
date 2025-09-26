import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload as UploadIcon, X, Image } from 'lucide-react';

export default function Upload() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    osNumber: '',
    title: '',
    description: '',
    startDate: '',
    clientUserId: '',
  });
  const [progressImages, setProgressImages] = useState<File[]>([]);
  const [reportImages, setReportImages] = useState<File[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'employee')) {
      navigate('/dashboard');
      return;
    }
    
    if (user && profile?.role === 'employee') {
      fetchClients();
    }
  }, [user, profile, loading, navigate]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .eq('role', 'client')
        .order('full_name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'progress' | 'report') => {
    const files = Array.from(e.target.files || []);
    if (type === 'progress') {
      setProgressImages(prev => [...prev, ...files]);
    } else {
      setReportImages(prev => [...prev, ...files]);
    }
  };

  const removeImage = (index: number, type: 'progress' | 'report') => {
    if (type === 'progress') {
      setProgressImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setReportImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const uploadImage = async (file: File, serviceOrderId: string, imageType: 'progress' | 'report') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${serviceOrderId}/${imageType}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('service-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('service-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Validate required fields
      if (!formData.osNumber || !formData.title || !formData.startDate || !formData.clientUserId) {
        throw new Error('Preencha todos os campos obrigatórios');
      }

      // Create service order
      const { data: serviceOrder, error: orderError } = await supabase
        .from('service_orders')
        .insert({
          os_number: formData.osNumber,
          title: formData.title,
          description: formData.description,
          start_date: formData.startDate,
          user_id: formData.clientUserId,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Upload progress images
      for (const file of progressImages) {
        const imageUrl = await uploadImage(file, serviceOrder.id, 'progress');
        await supabase
          .from('service_images')
          .insert({
            service_order_id: serviceOrder.id,
            image_url: imageUrl,
            image_type: 'progress',
            description: file.name,
          });
      }

      // Upload report images
      for (const file of reportImages) {
        const imageUrl = await uploadImage(file, serviceOrder.id, 'report');
        await supabase
          .from('service_images')
          .insert({
            service_order_id: serviceOrder.id,
            image_url: imageUrl,
            image_type: 'report',
            description: file.name,
          });
      }

      toast({
        title: 'Serviço criado com sucesso!',
        description: 'A ordem de serviço foi registrada e as imagens foram enviadas.',
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Erro ao criar serviço',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center">
              <UploadIcon className="w-6 h-6 mr-2" />
              Nova Ordem de Serviço
            </CardTitle>
            <CardDescription>
              Registre uma nova ordem de serviço e envie as imagens do andamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="osNumber">Número da OS *</Label>
                  <Input
                    id="osNumber"
                    placeholder="Ex: OS-2024-001"
                    value={formData.osNumber}
                    onChange={(e) => setFormData({ ...formData, osNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data de Início *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título do Serviço *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Instalação de fibra óptica"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">Cliente *</Label>
                <Select
                  value={formData.clientUserId}
                  onValueChange={(value) => setFormData({ ...formData, clientUserId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.user_id} value={client.user_id}>
                        {client.full_name || 'Cliente sem nome'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva os detalhes do serviço..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Progress Images */}
              <div className="space-y-4">
                <div>
                  <Label>Imagens do Andamento</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Adicione fotos do progresso da obra/serviço
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileChange(e, 'progress')}
                    className="mb-2"
                  />
                  {progressImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {progressImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Progress ${index + 1}`}
                            className="w-full h-24 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 p-0"
                            onClick={() => removeImage(index, 'progress')}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Report Images */}
                <div>
                  <Label>Imagens de Relatórios</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Adicione fotos de relatórios e documentos
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileChange(e, 'report')}
                    className="mb-2"
                  />
                  {reportImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {reportImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Report ${index + 1}`}
                            className="w-full h-24 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 p-0"
                            onClick={() => removeImage(index, 'report')}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={uploading} className="flex-1">
                  {uploading ? 'Enviando...' : 'Criar Ordem de Serviço'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}