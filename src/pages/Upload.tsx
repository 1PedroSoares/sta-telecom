import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload as UploadIcon, X, Camera, FileText } from 'lucide-react';

interface Client {
  id: string;
  full_name: string;
}

// Mock clients data
const mockClients: Client[] = [
  { id: '1', full_name: 'João Silva' },
  { id: '2', full_name: 'Maria Santos' },
  { id: '3', full_name: 'Pedro Costa' },
  { id: '4', full_name: 'Ana Oliveira' },
];

export default function Upload() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [progressImages, setProgressImages] = useState<File[]>([]);
  const [reportImages, setReportImages] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    osNumber: '',
    title: '',
    description: '',
    startDate: '',
    clientId: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'employee') {
      navigate('/dashboard');
      return;
    }
    
    // Simulate loading clients
    setTimeout(() => {
      setClients(mockClients);
    }, 500);
  }, [user, navigate]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.osNumber || !formData.title || !formData.startDate) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Ordem de Serviço criada com sucesso!',
        description: `OS ${formData.osNumber} foi registrada no sistema.`,
      });
      
      setLoading(false);
      navigate('/dashboard');
    }, 2000);
  };

  const createImagePreview = (file: File) => {
    return URL.createObjectURL(file);
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Nova Ordem de Serviço</h1>
          <p className="text-muted-foreground">Registre uma nova OS e faça upload das imagens</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <UploadIcon className="w-6 h-6 text-primary" />
              Informações da Ordem de Serviço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
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
                  placeholder="Ex: Instalação de Torre de Telecomunicações"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
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

              <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Progress Images Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  <Label className="text-lg font-medium">Imagens do Progresso</Label>
                </div>
                
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'progress')}
                    className="hidden"
                    id="progress-upload"
                  />
                  <Label htmlFor="progress-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <UploadIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Clique para adicionar imagens do progresso
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Suporta múltiplas imagens (JPG, PNG)
                      </p>
                    </div>
                  </Label>
                </div>

                {progressImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {progressImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={createImagePreview(file)}
                          alt={`Progresso ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index, 'progress')}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Report Images Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <Label className="text-lg font-medium">Imagens dos Relatórios</Label>
                </div>
                
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'report')}
                    className="hidden"
                    id="report-upload"
                  />
                  <Label htmlFor="report-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Clique para adicionar imagens dos relatórios
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Suporta múltiplas imagens (JPG, PNG)
                      </p>
                    </div>
                  </Label>
                </div>

                {reportImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {reportImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={createImagePreview(file)}
                          alt={`Relatório ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index, 'report')}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Criando OS...' : 'Criar Ordem de Serviço'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}